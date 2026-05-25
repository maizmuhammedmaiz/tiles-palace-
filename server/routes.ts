import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

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
      const { customerName, productId, productName, price, quantity } = req.body;
      if (!customerName || !productId || !price) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const qty = quantity || 1;
      const total = (parseFloat(price) * qty).toFixed(2);
      const order = await storage.createOrder(
        { customerName, total, createdAt: new Date().toISOString() },
        [{ orderId: 0, productId: parseInt(productId), quantity: qty, price: String(price) }]
      );
      res.status(201).json(order);
    } catch (err) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Seed Data
  await storage.seedProducts();
  await storage.seedServices();

  return httpServer;
}
