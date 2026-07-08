import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.adminLoggedIn) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Products API
  app.get(api.products.list.path, async (req, res) => {
    const category = req.query.category as string | undefined;
    const products = await storage.getProducts(category);
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  // Inquiries API
  app.post(api.inquiries.create.path, async (req, res) => {
    try {
      const input = api.inquiries.create.input.parse(req.body);
      const inquiry = await storage.createInquiry(input);
      res.status(201).json(inquiry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.get(api.services.list.path, async (req, res) => {
    const items = await storage.getServices();
    res.json(items);
  });

  // Admin Auth
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      req.session.adminLoggedIn = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/admin/me", (req, res) => {
    if (req.session?.adminLoggedIn) {
      res.json({ loggedIn: true });
    } else {
      res.json({ loggedIn: false });
    }
  });

  // Admin APIs (protected)
  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });

  app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await storage.updateProduct(id, req.body);
    res.json(product);
  });

  app.get("/api/admin/inquiries", requireAdmin, async (req, res) => {
    const items = await storage.getInquiries();
    res.json(items);
  });

  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.post("/api/admin/orders", requireAdmin, async (req, res) => {
    const { order, items } = req.body;
    const newOrder = await storage.createOrder(order, items);
    res.status(201).json(newOrder);
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const order = await storage.updateOrderStatus(id, req.body.status);
    res.json(order);
  });

  app.get("/api/admin/analytics/daily-sales", requireAdmin, async (req, res) => {
    const sales = await storage.getDailySales();
    res.json(sales);
  });

  app.get("/api/admin/analytics/monthly-sales", requireAdmin, async (req, res) => {
    const sales = await storage.getMonthlySales();
    res.json(sales);
  });

  // Admin portfolio (Our Work) management
  app.post("/api/admin/services", requireAdmin, async (req, res) => {
    const service = await storage.createService(req.body);
    res.status(201).json(service);
  });

  app.delete("/api/admin/services/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteService(id);
    res.json({ success: true });
  });

  // Public order creation (from product page — saved to DB)
  app.post("/api/orders", async (req, res) => {
    try {
      const { customerName, phone, location, productId, productName, price, quantity } = req.body;
      if (!customerName || !productId || !price) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const qty = quantity || 1;
      const total = (parseFloat(price) * qty).toFixed(2);
      const order = await storage.createOrder(
        { customerName, phone: phone || null, location: location || null, total, createdAt: new Date().toISOString() },
        [{ orderId: 0, productId: parseInt(productId), quantity: qty, price: String(price) }]
      );
      res.status(201).json(order);
    } catch (err) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Gemini AI Photo Scanner — identify product from image
  app.post("/api/ai/scan-product", async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) return res.status(400).json({ message: "No image provided" });

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(503).json({ message: "AI scanner not configured. Please add your GEMINI_API_KEY." });

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const categories = ["Tiles", "Lighting", "Kitchen Fittings", "Showers", "Washbasins", "Water Heaters"];

      const prompt = `You are a home fittings product identifier for a store called Tiles Palace.
Look at this image and identify what home fitting or product is shown.
Our store categories are: ${categories.join(", ")}.

Respond with JSON only (no markdown), with these fields:
- "category": the most matching category from our list, or null if none match
- "searchQuery": a short 1-3 word search term describing the product (e.g. "marble floor tiles", "rainfall shower", "pendant light")
- "description": one sentence describing what you see in the image
- "confidence": "high", "medium", or "low"`;

      const result = await model.generateContent([
        { inlineData: { data: imageBase64, mimeType: mimeType || "image/jpeg" } },
        { text: prompt }
      ]);

      const text = result.response.text().trim();
      const jsonText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(jsonText);
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini scan error:", err?.message);
      res.status(500).json({ message: "Could not analyse image. Please try again." });
    }
  });

  // Purchase Invoice APIs
  app.post("/api/admin/purchase-invoices", requireAdmin, async (req, res) => {
    try {
      const { invoice, items } = req.body;
      if (!invoice || !items) return res.status(400).json({ message: "Missing invoice data" });
      const newInvoice = await storage.createPurchaseInvoice(invoice, items);
      res.status(201).json(newInvoice);
    } catch (err: any) {
      console.error("Purchase invoice error:", err?.message);
      res.status(500).json({ message: "Failed to save purchase invoice" });
    }
  });

  app.get("/api/admin/purchase-invoices", requireAdmin, async (req, res) => {
    const invoices = await storage.getPurchaseInvoices();
    res.json(invoices);
  });

  app.get("/api/admin/purchase-invoices/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await storage.getPurchaseInvoiceWithItems(id);
    if (!result) return res.status(404).json({ message: "Invoice not found" });
    res.json(result);
  });

  app.get("/api/admin/analytics/profit", requireAdmin, async (req, res) => {
    try {
      const data = await storage.getProfitAnalytics();
      res.json(data);
    } catch (err: any) {
      console.error("Profit analytics error:", err?.message);
      res.status(500).json({ message: "Failed to get profit analytics" });
    }
  });

  // Gemini AI Invoice Scanner — extract line items from a bill image
  app.post("/api/ai/scan-invoice", async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!imageBase64) return res.status(400).json({ message: "No image provided" });

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(503).json({ message: "AI scanner not configured. Please add your GEMINI_API_KEY." });

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `You are an expert invoice/bill data extractor for a tiles and home fittings wholesale store.
Look at this invoice or bill image and extract ALL line items with as much detail as possible.

Respond with JSON only (no markdown), in this exact format:
{
  "supplier": "supplier or vendor company name if visible, else null",
  "invoiceNumber": "invoice or bill number if visible, else null",
  "date": "invoice date if visible (DD/MM/YYYY format), else null",
  "items": [
    {
      "name": "full product name",
      "brand": "brand name if visible, else null",
      "size": "dimensions like 600x600 or 300x600 if visible, else null",
      "color": "color description if visible, else null",
      "finish": "finish type like matte/glossy/satin if visible, else null",
      "qty": 1,
      "unit": "unit like pcs/sqft/box/carton, else pcs",
      "purchasePrice": 0.00,
      "gst": 18,
      "discount": 0
    }
  ]
}

Rules:
- Extract EVERY line item you can see on the invoice
- "purchasePrice" = unit price per item (not line total). If labeled as rate/price/unit price, use that
- "qty" = quantity ordered. If not visible, default to 1
- "gst" = GST percentage (e.g. 18 for 18%). If not visible, use 18
- "discount" = discount percentage if shown, else 0
- Convert any currency symbols/commas to plain numeric value
- "brand" — look for known tile brands: Kajaria, Somany, Asian Granito, CERA, Johnson, Nitco, Orient, Qutone etc.
- "size" — look for dimensions like 600x600, 300x600, 800x800, 12x12 etc.
- Keep product names concise but descriptive (include brand + type + size if visible)
- If you cannot read the invoice, return { "supplier": null, "invoiceNumber": null, "date": null, "items": [] }`;

      const result = await model.generateContent([
        { inlineData: { data: imageBase64, mimeType: mimeType || "image/jpeg" } },
        { text: prompt }
      ]);

      const text = result.response.text().trim();
      const jsonText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(jsonText);
      res.json(parsed);
    } catch (err: any) {
      console.error("Invoice scan error:", err?.message);
      res.status(500).json({ message: "Could not read invoice. Please try again." });
    }
  });

  // Invoice bulk import — create/update products from scanned invoice
  app.post("/api/admin/invoice-import", requireAdmin, async (req, res) => {
    try {
      const { items, supplierName } = req.body;
      if (!items?.length) return res.status(400).json({ message: "No items provided" });
      const result = await storage.importInvoiceProducts(items, supplierName || "Unknown Supplier");
      const totalPurchase = items.reduce((s: number, i: any) => s + (Number(i.purchasePrice) * Number(i.qty)), 0);
      const totalQty = items.reduce((s: number, i: any) => s + Number(i.qty), 0);
      res.json({
        newCount: result.newProducts.length,
        updatedCount: result.updatedProducts.length,
        newProducts: result.newProducts,
        updatedProducts: result.updatedProducts,
        totalPurchase,
        totalQty,
      });
    } catch (err: any) {
      console.error("Invoice import error:", err?.message);
      res.status(500).json({ message: "Failed to import invoice products" });
    }
  });

  // Public settings (whatsapp number used by frontend)
  app.get("/api/settings", async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  // Admin settings update
  app.patch("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateSettings(req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  // Seed Data
  await storage.seedProducts();
  await storage.seedServices();

  return httpServer;
}
