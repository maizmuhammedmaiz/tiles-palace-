var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/api.ts
import express from "express";
import session from "express-session";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  inquiries: () => inquiries,
  insertInquirySchema: () => insertInquirySchema,
  insertOrderItemSchema: () => insertOrderItemSchema,
  insertOrderSchema: () => insertOrderSchema,
  insertProductSchema: () => insertProductSchema,
  insertPurchaseInvoiceItemSchema: () => insertPurchaseInvoiceItemSchema,
  insertPurchaseInvoiceSchema: () => insertPurchaseInvoiceSchema,
  insertServiceSchema: () => insertServiceSchema,
  orderItems: () => orderItems,
  orders: () => orders,
  products: () => products,
  purchaseInvoiceItems: () => purchaseInvoiceItems,
  purchaseInvoices: () => purchaseInvoices,
  services: () => services,
  storeSettings: () => storeSettings
});
import { pgTable, text, serial, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  featured: boolean("featured").default(false),
  stockQty: integer("stock_qty").default(0),
  costPrice: numeric("cost_price")
});
var inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  productId: integer("product_id")
});
var insertProductSchema = createInsertSchema(products).omit({ id: true });
var insertInquirySchema = createInsertSchema(inquiries).omit({ id: true });
var orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  phone: text("phone"),
  location: text("location"),
  total: numeric("total").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull()
});
var orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull()
});
var insertOrderSchema = createInsertSchema(orders).omit({ id: true, status: true });
var insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
var services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  type: text("type").notNull()
});
var insertServiceSchema = createInsertSchema(services).omit({ id: true });
var storeSettings = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  whatsappNumber: text("whatsapp_number").notNull().default(""),
  storeName: text("store_name").notNull().default("Tiles Palace"),
  storePhone: text("store_phone").notNull().default(""),
  storeEmail: text("store_email").notNull().default(""),
  storeAddress: text("store_address").notNull().default("")
});
var purchaseInvoices = pgTable("purchase_invoices", {
  id: serial("id").primaryKey(),
  supplierName: text("supplier_name").notNull(),
  invoiceNumber: text("invoice_number"),
  invoiceDate: text("invoice_date"),
  notes: text("notes"),
  totalCost: numeric("total_cost").notNull().default("0"),
  totalSellingValue: numeric("total_selling_value").notNull().default("0"),
  totalProfit: numeric("total_profit").notNull().default("0"),
  createdAt: text("created_at").notNull()
});
var purchaseInvoiceItems = pgTable("purchase_invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  productId: integer("product_id"),
  productName: text("product_name").notNull(),
  qty: integer("qty").notNull(),
  purchasePrice: numeric("purchase_price").notNull(),
  sellingPrice: numeric("selling_price").notNull(),
  profitPerUnit: numeric("profit_per_unit").notNull()
});
var insertPurchaseInvoiceSchema = createInsertSchema(purchaseInvoices).omit({ id: true });
var insertPurchaseInvoiceItemSchema = createInsertSchema(purchaseInvoiceItems).omit({ id: true });

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
var { Pool } = pg;
var connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/tile_haven";
var isRemoteDb = !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost") && !process.env.DATABASE_URL.includes("127.0.0.1");
var pool = new Pool({
  connectionString,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
  // Neon pooler timeout
  connectionTimeoutMillis: 1e4
});
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, ilike, sql } from "drizzle-orm";
var DatabaseStorage = class {
  async getProducts(category) {
    if (category) {
      const pattern = `%${category.replace(/-/g, "%")}%`;
      return await db.select().from(products).where(ilike(products.category, pattern));
    }
    return await db.select().from(products);
  }
  async getProduct(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  async createProduct(insertProduct) {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }
  async updateProduct(id, update) {
    const [product] = await db.update(products).set(update).where(eq(products.id, id)).returning();
    return product;
  }
  async deleteProduct(id) {
    await db.delete(products).where(eq(products.id, id));
  }
  async createInquiry(insertInquiry) {
    const [inquiry] = await db.insert(inquiries).values(insertInquiry).returning();
    return inquiry;
  }
  async getInquiries() {
    return await db.select().from(inquiries).orderBy(sql`${inquiries.id} DESC`);
  }
  async getServices() {
    return await db.select().from(services);
  }
  async createService(service) {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }
  async deleteService(id) {
    await db.delete(services).where(eq(services.id, id));
  }
  async getOrders() {
    return await db.select().from(orders).orderBy(sql`${orders.id} DESC`);
  }
  async getOrderItems(orderId) {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  async createOrder(order, items) {
    const [newOrder] = await db.insert(orders).values(order).returning();
    const itemsWithId = items.map((item) => ({ ...item, orderId: newOrder.id }));
    if (itemsWithId.length > 0) {
      await db.insert(orderItems).values(itemsWithId);
      for (const item of itemsWithId) {
        await db.update(products).set({ stockQty: sql`GREATEST(0, COALESCE(${products.stockQty}, 0) - ${item.quantity})` }).where(eq(products.id, item.productId));
      }
    }
    return newOrder;
  }
  async updateOrderStatus(id, status) {
    const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return order;
  }
  async getDailySales() {
    const result = await db.select({
      date: sql`SUBSTRING(${orders.createdAt}, 1, 10)`,
      total: sql`SUM(${orders.total})::text`,
      count: sql`COUNT(*)::int`
    }).from(orders).where(eq(orders.status, "completed")).groupBy(sql`SUBSTRING(${orders.createdAt}, 1, 10)`);
    return result;
  }
  async getMonthlySales() {
    const result = await db.select({
      month: sql`SUBSTRING(${orders.createdAt}, 1, 7)`,
      total: sql`SUM(${orders.total})::text`,
      count: sql`COUNT(*)::int`
    }).from(orders).where(eq(orders.status, "completed")).groupBy(sql`SUBSTRING(${orders.createdAt}, 1, 7)`);
    return result;
  }
  async getSettings() {
    const [row] = await db.select().from(storeSettings).limit(1);
    if (row) return row;
    const [newRow] = await db.insert(storeSettings).values({
      whatsappNumber: "",
      storeName: "Tiles Palace",
      storePhone: "",
      storeEmail: "",
      storeAddress: ""
    }).returning();
    return newRow;
  }
  async updateSettings(data) {
    const existing = await this.getSettings();
    const [updated] = await db.update(storeSettings).set(data).where(eq(storeSettings.id, existing.id)).returning();
    return updated;
  }
  async createPurchaseInvoice(invoice, items) {
    const [newInvoice] = await db.insert(purchaseInvoices).values(invoice).returning();
    if (items.length > 0) {
      const itemsWithId = items.map((i) => ({ ...i, invoiceId: newInvoice.id }));
      await db.insert(purchaseInvoiceItems).values(itemsWithId);
      for (const item of itemsWithId) {
        if (item.productId) {
          await db.update(products).set({
            stockQty: sql`COALESCE(${products.stockQty}, 0) + ${item.qty}`,
            costPrice: item.purchasePrice
          }).where(eq(products.id, item.productId));
        }
      }
    }
    return newInvoice;
  }
  async getPurchaseInvoices() {
    const result = await db.select({
      id: purchaseInvoices.id,
      supplierName: purchaseInvoices.supplierName,
      invoiceNumber: purchaseInvoices.invoiceNumber,
      invoiceDate: purchaseInvoices.invoiceDate,
      notes: purchaseInvoices.notes,
      totalCost: purchaseInvoices.totalCost,
      totalSellingValue: purchaseInvoices.totalSellingValue,
      totalProfit: purchaseInvoices.totalProfit,
      createdAt: purchaseInvoices.createdAt,
      itemCount: sql`COUNT(${purchaseInvoiceItems.id})::int`
    }).from(purchaseInvoices).leftJoin(purchaseInvoiceItems, eq(purchaseInvoiceItems.invoiceId, purchaseInvoices.id)).groupBy(purchaseInvoices.id).orderBy(sql`${purchaseInvoices.id} DESC`);
    return result;
  }
  async getPurchaseInvoiceWithItems(id) {
    const [invoice] = await db.select().from(purchaseInvoices).where(eq(purchaseInvoices.id, id));
    if (!invoice) return null;
    const items = await db.select().from(purchaseInvoiceItems).where(eq(purchaseInvoiceItems.invoiceId, id));
    return { invoice, items };
  }
  async getProfitAnalytics() {
    const [totals] = await db.select({
      totalCost: sql`COALESCE(SUM(${purchaseInvoices.totalCost}), 0)::text`,
      totalSellingValue: sql`COALESCE(SUM(${purchaseInvoices.totalSellingValue}), 0)::text`,
      totalProfit: sql`COALESCE(SUM(${purchaseInvoices.totalProfit}), 0)::text`
    }).from(purchaseInvoices);
    const [revRow] = await db.select({
      totalRevenue: sql`COALESCE(SUM(${orders.total}), 0)::text`
    }).from(orders).where(eq(orders.status, "completed"));
    const productRows = await db.select().from(products);
    const invoiceItemRows = await db.select({
      productId: purchaseInvoiceItems.productId,
      productName: purchaseInvoiceItems.productName,
      totalPurchased: sql`SUM(${purchaseInvoiceItems.qty})::int`,
      totalCost: sql`SUM(${purchaseInvoiceItems.purchasePrice}::numeric * ${purchaseInvoiceItems.qty})::text`,
      totalExpectedProfit: sql`SUM(${purchaseInvoiceItems.profitPerUnit}::numeric * ${purchaseInvoiceItems.qty})::text`
    }).from(purchaseInvoiceItems).groupBy(purchaseInvoiceItems.productId, purchaseInvoiceItems.productName);
    const soldRows = await db.select({
      productId: orderItems.productId,
      totalSold: sql`SUM(${orderItems.quantity})::int`
    }).from(orderItems).groupBy(orderItems.productId);
    const soldMap = {};
    for (const row of soldRows) soldMap[row.productId] = row.totalSold;
    const productStats = invoiceItemRows.map((row) => {
      const product = row.productId ? productRows.find((p) => p.id === row.productId) : null;
      const stockQty = product?.stockQty ?? 0;
      const costPrice = parseFloat(product?.costPrice ?? "0") || 0;
      const sellingPrice = parseFloat(product?.price ?? "0") || 0;
      const profitPerUnit = sellingPrice - costPrice;
      const totalSold = row.productId ? soldMap[row.productId] ?? 0 : 0;
      return {
        productId: row.productId ?? null,
        productName: product?.name ?? row.productName,
        stockQty,
        costPrice,
        sellingPrice,
        profitPerUnit,
        totalPurchased: row.totalPurchased ?? 0,
        totalSold,
        totalStockCost: costPrice * stockQty,
        totalExpectedProfit: parseFloat(row.totalExpectedProfit ?? "0") || 0
      };
    });
    return {
      totalPurchaseCost: parseFloat(totals?.totalCost ?? "0") || 0,
      totalSellingValue: parseFloat(totals?.totalSellingValue ?? "0") || 0,
      totalExpectedProfit: parseFloat(totals?.totalProfit ?? "0") || 0,
      totalRevenue: parseFloat(revRow?.totalRevenue ?? "0") || 0,
      productStats
    };
  }
  async importInvoiceProducts(items, supplierName) {
    const allProducts = await this.getProducts();
    const newProductsList = [];
    const updatedProductsList = [];
    const seen = /* @__PURE__ */ new Set();
    for (const item of items) {
      const nameLower = item.name.toLowerCase().trim();
      if (seen.has(nameLower)) continue;
      seen.add(nameLower);
      const existing = allProducts.find((p) => p.name.toLowerCase().trim() === nameLower);
      if (existing) {
        const updated = await this.updateProduct(existing.id, {
          stockQty: (existing.stockQty || 0) + item.qty,
          costPrice: String(item.purchasePrice)
        });
        updatedProductsList.push(updated);
      } else {
        const descParts = [item.brand, item.size, item.color, item.finish].filter(Boolean);
        const description = descParts.length > 0 ? descParts.join(" \xB7 ") : `Imported from ${supplierName}`;
        const newProduct = await this.createProduct({
          name: item.name,
          description,
          price: String(item.sellingPrice || item.purchasePrice),
          category: item.category,
          imageUrl: "",
          featured: false,
          stockQty: item.qty,
          costPrice: String(item.purchasePrice)
        });
        newProductsList.push(newProduct);
      }
    }
    return { newProducts: newProductsList, updatedProducts: updatedProductsList };
  }
  async seedServices() {
    const existing = await db.select().from(services).limit(1);
    if (existing.length > 0) return;
    const seedData = [
      { title: "Modern Bathroom Renovation", description: "Complete overhaul with premium marble tiles and rainfall shower.", type: "photo", imageUrl: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800" },
      { title: "Designer Kitchen Lighting", description: "Installation of custom pendant lights and smart LED strips.", type: "photo", imageUrl: "https://images.unsplash.com/photo-1556912177-c54844bdb962?auto=format&fit=crop&q=80&w=800" }
    ];
    await db.insert(services).values(seedData);
  }
  async seedProducts() {
    const existing = await db.select().from(products).limit(1);
    if (existing.length > 0) return;
    const seedData = [
      { name: "Premium Marble Floor Tiles", description: "Elegant white marble tiles with grey veining, perfect for living rooms.", price: "4500", category: "Tiles", imageUrl: "attached_assets/stock_images/premium_marble_floor_5df6a86a.jpg", featured: true },
      { name: "Ceramic Wall Tiles", description: "Textured ceramic tiles for bathrooms and kitchens.", price: "2500", category: "Tiles", imageUrl: "attached_assets/stock_images/ceramic_wall_tiles_b_dac2c109.jpg", featured: false },
      { name: "Modern Ceramic Basin", description: "Sleek countertop basin with a glossy finish.", price: "12000", category: "Washbasins", imageUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=800", featured: true },
      { name: "Classic Pedestal Sink", description: "Timeless design for traditional bathrooms.", price: "9500", category: "Washbasins", imageUrl: "attached_assets/stock_images/classic_pedestal_sin_d333865c.jpg", featured: false },
      { name: "Rainfall Shower Head", description: "Luxury 10-inch rainfall shower head in chrome finish.", price: "8500", category: "Showers", imageUrl: "attached_assets/stock_images/rainfall_shower_head_700cf018.jpg", featured: true },
      { name: "Stainless Steel Sink", description: "Double bowl kitchen sink, scratch resistant.", price: "15000", category: "Kitchen Fittings", imageUrl: "attached_assets/stock_images/stainless_steel_kitc_9a024fed.jpg", featured: true },
      { name: "Pull-Down Kitchen Faucet", description: "High-arc faucet with pull-down sprayer.", price: "11000", category: "Kitchen Fittings", imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800", featured: false },
      { name: "Smart LED Bulb", description: "WiFi enabled color changing bulb.", price: "1500", category: "Lighting", imageUrl: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800", featured: false },
      { name: "Modern Pendant Light", description: "Fancy hanging light for dining areas.", price: "7500", category: "Lighting", imageUrl: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=800", featured: true },
      { name: "Premium Digital Water Heater with Shower", description: "Advanced digital water heater featuring real-time temperature display and integrated shower system.", price: "20000", category: "Water Heaters", imageUrl: "/images/water-heater-shower.png", featured: false }
    ];
    await db.insert(products).values(seedData);
  }
};
var storage = new DatabaseStorage();

// shared/routes.ts
import { z } from "zod";
var errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional()
  }),
  notFound: z.object({
    message: z.string()
  }),
  internal: z.object({
    message: z.string()
  })
};
var api = {
  products: {
    list: {
      method: "GET",
      path: "/api/products",
      input: z.object({
        category: z.string().optional()
      }).optional(),
      responses: {
        200: z.array(z.custom())
      }
    },
    get: {
      method: "GET",
      path: "/api/products/:id",
      responses: {
        200: z.custom(),
        404: errorSchemas.notFound
      }
    }
  },
  services: {
    list: {
      method: "GET",
      path: "/api/services",
      responses: {
        200: z.array(z.custom())
      }
    }
  },
  inquiries: {
    create: {
      method: "POST",
      path: "/api/inquiries",
      input: insertInquirySchema,
      responses: {
        201: z.custom(),
        400: errorSchemas.validation
      }
    }
  }
};

// server/routes.ts
import { z as z2 } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
var ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
var ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
function checkAdminAuth(req) {
  if (req.session?.adminLoggedIn) return true;
  const cookieHeader = req.headers.cookie || "";
  return cookieHeader.includes("admin_auth=1");
}
function requireAdmin(req, res, next) {
  if (checkAdminAuth(req)) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}
function registerRoutes(httpServer2, app2) {
  app2.get(api.products.list.path, async (req, res) => {
    const category = req.query.category;
    const products3 = await storage.getProducts(category);
    res.json(products3);
  });
  app2.get(api.products.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await storage.getProduct(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });
  app2.post(api.inquiries.create.path, async (req, res) => {
    try {
      const input = api.inquiries.create.input.parse(req.body);
      const inquiry = await storage.createInquiry(input);
      res.status(201).json(inquiry);
    } catch (err) {
      if (err instanceof z2.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join(".")
        });
      }
      throw err;
    }
  });
  app2.get(api.services.list.path, async (req, res) => {
    const items = await storage.getServices();
    res.json(items);
  });
  const isProduction = process.env.NODE_ENV === "production";
  const cookieFlags = isProduction ? "Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=None" : "Path=/; Max-Age=86400; HttpOnly; SameSite=Lax";
  app2.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    const inputUser = String(username || "").trim().toLowerCase();
    const inputPass = String(password || "").trim();
    const targetUser = ADMIN_USERNAME.trim().toLowerCase();
    const targetPass = ADMIN_PASSWORD.trim();
    if (inputUser === targetUser && inputPass === targetPass) {
      if (req.session) {
        req.session.adminLoggedIn = true;
      }
      res.setHeader("Set-Cookie", `admin_auth=1; ${cookieFlags}`);
      res.json({ success: true });
    } else {
      res.status(401).json({ message: "Invalid username or password" });
    }
  });
  app2.post("/api/admin/logout", (req, res) => {
    if (req.session) {
      req.session.destroy(() => {
      });
    }
    const expireFlags = isProduction ? "Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None" : "Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax";
    res.setHeader("Set-Cookie", `admin_auth=; ${expireFlags}`);
    res.json({ success: true });
  });
  app2.get("/api/admin/me", (req, res) => {
    if (checkAdminAuth(req)) {
      res.json({ loggedIn: true });
    } else {
      res.json({ loggedIn: false });
    }
  });
  app2.post("/api/admin/products", requireAdmin, async (req, res) => {
    const product = await storage.createProduct(req.body);
    res.status(201).json(product);
  });
  app2.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await storage.updateProduct(id, req.body);
    res.json(product);
  });
  app2.get("/api/admin/inquiries", requireAdmin, async (req, res) => {
    const items = await storage.getInquiries();
    res.json(items);
  });
  app2.get("/api/admin/orders", requireAdmin, async (req, res) => {
    const orders2 = await storage.getOrders();
    res.json(orders2);
  });
  app2.post("/api/admin/orders", requireAdmin, async (req, res) => {
    const { order, items } = req.body;
    const newOrder = await storage.createOrder(order, items);
    res.status(201).json(newOrder);
  });
  app2.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const order = await storage.updateOrderStatus(id, req.body.status);
    res.json(order);
  });
  app2.get("/api/admin/analytics/daily-sales", requireAdmin, async (req, res) => {
    const sales = await storage.getDailySales();
    res.json(sales);
  });
  app2.get("/api/admin/analytics/monthly-sales", requireAdmin, async (req, res) => {
    const sales = await storage.getMonthlySales();
    res.json(sales);
  });
  app2.post("/api/admin/services", requireAdmin, async (req, res) => {
    const service = await storage.createService(req.body);
    res.status(201).json(service);
  });
  app2.delete("/api/admin/services/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteService(id);
    res.json({ success: true });
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const { customerName, phone, location, productId, productName, price, quantity } = req.body;
      if (!customerName || !productId || !price) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const qty = quantity || 1;
      const total = (parseFloat(price) * qty).toFixed(2);
      const order = await storage.createOrder(
        { customerName, phone: phone || null, location: location || null, total, createdAt: (/* @__PURE__ */ new Date()).toISOString() },
        [{ orderId: 0, productId: parseInt(productId), quantity: qty, price: String(price) }]
      );
      res.status(201).json(order);
    } catch (err) {
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  app2.post("/api/ai/scan-product", async (req, res) => {
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
      const text2 = result.response.text().trim();
      const jsonText = text2.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(jsonText);
      res.json(parsed);
    } catch (err) {
      console.error("Gemini scan error:", err?.message);
      res.status(500).json({ message: "Could not analyse image. Please try again." });
    }
  });
  app2.post("/api/admin/purchase-invoices", requireAdmin, async (req, res) => {
    try {
      const { invoice, items } = req.body;
      if (!invoice || !items) return res.status(400).json({ message: "Missing invoice data" });
      const newInvoice = await storage.createPurchaseInvoice(invoice, items);
      res.status(201).json(newInvoice);
    } catch (err) {
      console.error("Purchase invoice error:", err?.message);
      res.status(500).json({ message: "Failed to save purchase invoice" });
    }
  });
  app2.get("/api/admin/purchase-invoices", requireAdmin, async (req, res) => {
    const invoices = await storage.getPurchaseInvoices();
    res.json(invoices);
  });
  app2.get("/api/admin/purchase-invoices/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await storage.getPurchaseInvoiceWithItems(id);
    if (!result) return res.status(404).json({ message: "Invoice not found" });
    res.json(result);
  });
  app2.get("/api/admin/analytics/profit", requireAdmin, async (req, res) => {
    try {
      const data = await storage.getProfitAnalytics();
      res.json(data);
    } catch (err) {
      console.error("Profit analytics error:", err?.message);
      res.status(500).json({ message: "Failed to get profit analytics" });
    }
  });
  app2.post("/api/ai/scan-invoice", async (req, res) => {
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
- "brand" \u2014 look for known tile brands: Kajaria, Somany, Asian Granito, CERA, Johnson, Nitco, Orient, Qutone etc.
- "size" \u2014 look for dimensions like 600x600, 300x600, 800x800, 12x12 etc.
- Keep product names concise but descriptive (include brand + type + size if visible)
- If you cannot read the invoice, return { "supplier": null, "invoiceNumber": null, "date": null, "items": [] }`;
      const result = await model.generateContent([
        { inlineData: { data: imageBase64, mimeType: mimeType || "image/jpeg" } },
        { text: prompt }
      ]);
      const text2 = result.response.text().trim();
      const jsonText = text2.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(jsonText);
      res.json(parsed);
    } catch (err) {
      console.error("Invoice scan error:", err?.message);
      res.status(500).json({ message: "Could not read invoice. Please try again." });
    }
  });
  app2.post("/api/admin/invoice-import", requireAdmin, async (req, res) => {
    try {
      const { items, supplierName } = req.body;
      if (!items?.length) return res.status(400).json({ message: "No items provided" });
      const result = await storage.importInvoiceProducts(items, supplierName || "Unknown Supplier");
      const totalPurchase = items.reduce((s, i) => s + Number(i.purchasePrice) * Number(i.qty), 0);
      const totalQty = items.reduce((s, i) => s + Number(i.qty), 0);
      res.json({
        newCount: result.newProducts.length,
        updatedCount: result.updatedProducts.length,
        newProducts: result.newProducts,
        updatedProducts: result.updatedProducts,
        totalPurchase,
        totalQty
      });
    } catch (err) {
      console.error("Invoice import error:", err?.message);
      res.status(500).json({ message: "Failed to import invoice products" });
    }
  });
  app2.get("/api/settings", async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });
  app2.patch("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateSettings(req.body);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Failed to save settings" });
    }
  });
  storage.seedProducts().catch(
    (err) => console.warn("Seeding products skipped:", err?.message || err)
  );
  storage.seedServices().catch(
    (err) => console.warn("Seeding services skipped:", err?.message || err)
  );
  return httpServer2;
}

// server/api.ts
import { createServer } from "http";
var app = express();
var httpServer = createServer(app);
app.set("trust proxy", 1);
app.get("/api/debug", (_req, res) => {
  res.json({
    ok: true,
    hasDbUrl: !!process.env.DATABASE_URL,
    hasAdminUser: !!process.env.ADMIN_USERNAME,
    hasAdminPass: !!process.env.ADMIN_PASSWORD,
    nodeEnv: process.env.NODE_ENV || "not set"
  });
});
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1e3
    }
  })
);
app.use(
  express.json({
    limit: "20mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(express.urlencoded({ extended: false }));
try {
  registerRoutes(httpServer, app);
} catch (e) {
  console.error("Failed to register routes:", e);
  app.use("/api", (_req, res) => {
    res.status(500).json({ message: "Server init failed: " + e?.message });
  });
}
app.use((err, _req, res, _next) => {
  console.error("Express error:", err?.message);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});
function handler(req, res) {
  try {
    return app(req, res);
  } catch (err) {
    console.error("Vercel handler error:", err);
    return res.status(500).json({ message: err?.message || "Server Error" });
  }
}
export {
  handler as default
};
