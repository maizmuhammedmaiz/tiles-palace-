import { pgTable, text, serial, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  featured: boolean("featured").default(false),
  stockQty: integer("stock_qty").default(0),
  costPrice: numeric("cost_price"),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  productId: integer("product_id"),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertInquirySchema = createInsertSchema(inquiries).omit({ id: true });

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  phone: text("phone"),
  location: text("location"),
  total: numeric("total").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, status: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  type: text("type").notNull(),
});

export const insertServiceSchema = createInsertSchema(services).omit({ id: true });

export const storeSettings = pgTable("store_settings", {
  id: serial("id").primaryKey(),
  whatsappNumber: text("whatsapp_number").notNull().default(""),
  storeName: text("store_name").notNull().default("Tiles Palace"),
  storePhone: text("store_phone").notNull().default(""),
  storeEmail: text("store_email").notNull().default(""),
  storeAddress: text("store_address").notNull().default(""),
});

export const purchaseInvoices = pgTable("purchase_invoices", {
  id: serial("id").primaryKey(),
  supplierName: text("supplier_name").notNull(),
  invoiceNumber: text("invoice_number"),
  invoiceDate: text("invoice_date"),
  notes: text("notes"),
  totalCost: numeric("total_cost").notNull().default("0"),
  totalSellingValue: numeric("total_selling_value").notNull().default("0"),
  totalProfit: numeric("total_profit").notNull().default("0"),
  createdAt: text("created_at").notNull(),
});

export const purchaseInvoiceItems = pgTable("purchase_invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  productId: integer("product_id"),
  productName: text("product_name").notNull(),
  qty: integer("qty").notNull(),
  purchasePrice: numeric("purchase_price").notNull(),
  sellingPrice: numeric("selling_price").notNull(),
  profitPerUnit: numeric("profit_per_unit").notNull(),
});

export const insertPurchaseInvoiceSchema = createInsertSchema(purchaseInvoices).omit({ id: true });
export const insertPurchaseInvoiceItemSchema = createInsertSchema(purchaseInvoiceItems).omit({ id: true });

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type StoreSettings = typeof storeSettings.$inferSelect;
export type PurchaseInvoice = typeof purchaseInvoices.$inferSelect;
export type InsertPurchaseInvoice = z.infer<typeof insertPurchaseInvoiceSchema>;
export type PurchaseInvoiceItem = typeof purchaseInvoiceItems.$inferSelect;
export type InsertPurchaseInvoiceItem = z.infer<typeof insertPurchaseInvoiceItemSchema>;
