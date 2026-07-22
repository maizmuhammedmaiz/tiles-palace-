import { products, inquiries, services, orders, orderItems, storeSettings, purchaseInvoices, purchaseInvoiceItems, type Product, type InsertProduct, type Inquiry, type InsertInquiry, type Service, type InsertService, type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type StoreSettings, type PurchaseInvoice, type InsertPurchaseInvoice, type PurchaseInvoiceItem, type InsertPurchaseInvoiceItem } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, sql } from "drizzle-orm";

export interface IStorage {
  getProducts(category?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiries(): Promise<Inquiry[]>;
  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  deleteService(id: number): Promise<void>;
  getOrders(): Promise<Order[]>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  getDailySales(): Promise<{ date: string; total: string; count: number }[]>;
  getMonthlySales(): Promise<{ month: string; total: string; count: number }[]>;
  getSettings(): Promise<StoreSettings>;
  updateSettings(data: Partial<Omit<StoreSettings, "id">>): Promise<StoreSettings>;
  createPurchaseInvoice(invoice: InsertPurchaseInvoice, items: InsertPurchaseInvoiceItem[]): Promise<PurchaseInvoice>;
  getPurchaseInvoices(): Promise<(PurchaseInvoice & { itemCount: number })[]>;
  getPurchaseInvoiceWithItems(id: number): Promise<{ invoice: PurchaseInvoice; items: PurchaseInvoiceItem[] } | null>;
  getProfitAnalytics(): Promise<{
    totalPurchaseCost: number;
    totalSellingValue: number;
    totalExpectedProfit: number;
    totalRevenue: number;
    productStats: Array<{
      productId: number | null;
      productName: string;
      stockQty: number;
      costPrice: number;
      sellingPrice: number;
      profitPerUnit: number;
      totalPurchased: number;
      totalSold: number;
      totalStockCost: number;
      totalExpectedProfit: number;
    }>;
  }>;
  importInvoiceProducts(items: Array<{
    name: string; brand?: string; size?: string; color?: string; finish?: string;
    qty: number; purchasePrice: number; sellingPrice: number; category: string;
  }>, supplierName: string): Promise<{ newProducts: Product[]; updatedProducts: Product[] }>;
  seedProducts(): Promise<void>;
  seedServices(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(category?: string): Promise<Product[]> {
    if (category) {
      // Clean category slug and match dynamically with ilike pattern
      const pattern = `%${category.replace(/-/g, "%")}%`;
      return await db.select().from(products).where(ilike(products.category, pattern));
    }
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, update: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db.update(products).set(update).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db.insert(inquiries).values(insertInquiry).returning();
    return inquiry;
  }

  async getInquiries(): Promise<Inquiry[]> {
    return await db.select().from(inquiries).orderBy(sql`${inquiries.id} DESC`);
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async deleteService(id: number): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(sql`${orders.id} DESC`);
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    const itemsWithId = items.map(item => ({ ...item, orderId: newOrder.id }));
    if (itemsWithId.length > 0) {
      await db.insert(orderItems).values(itemsWithId);
      // Reduce stock for each item
      for (const item of itemsWithId) {
        await db.update(products)
          .set({ stockQty: sql`GREATEST(0, COALESCE(${products.stockQty}, 0) - ${item.quantity})` })
          .where(eq(products.id, item.productId));
      }
    }
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [order] = await db.update(orders).set({ status }).where(eq(orders.id, id)).returning();
    return order;
  }

  async getDailySales(): Promise<{ date: string; total: string; count: number }[]> {
    const result = await db.select({
      date: sql`SUBSTRING(${orders.createdAt}, 1, 10)`,
      total: sql`SUM(${orders.total})::text`,
      count: sql`COUNT(*)::int`
    }).from(orders).where(eq(orders.status, 'completed')).groupBy(sql`SUBSTRING(${orders.createdAt}, 1, 10)`);
    return result as any;
  }

  async getMonthlySales(): Promise<{ month: string; total: string; count: number }[]> {
    const result = await db.select({
      month: sql`SUBSTRING(${orders.createdAt}, 1, 7)`,
      total: sql`SUM(${orders.total})::text`,
      count: sql`COUNT(*)::int`
    }).from(orders).where(eq(orders.status, 'completed')).groupBy(sql`SUBSTRING(${orders.createdAt}, 1, 7)`);
    return result as any;
  }

  async getSettings(): Promise<StoreSettings> {
    const [row] = await db.select().from(storeSettings).limit(1);
    if (row) return row;
    const [newRow] = await db.insert(storeSettings).values({
      whatsappNumber: "",
      storeName: "Tiles Palace",
      storePhone: "",
      storeEmail: "",
      storeAddress: "",
    }).returning();
    return newRow;
  }

  async updateSettings(data: Partial<Omit<StoreSettings, "id">>): Promise<StoreSettings> {
    const existing = await this.getSettings();
    const [updated] = await db.update(storeSettings).set(data).where(eq(storeSettings.id, existing.id)).returning();
    return updated;
  }

  async createPurchaseInvoice(invoice: InsertPurchaseInvoice, items: InsertPurchaseInvoiceItem[]): Promise<PurchaseInvoice> {
    const [newInvoice] = await db.insert(purchaseInvoices).values(invoice).returning();
    if (items.length > 0) {
      const itemsWithId = items.map(i => ({ ...i, invoiceId: newInvoice.id }));
      await db.insert(purchaseInvoiceItems).values(itemsWithId);
      // Update product stock and cost price for catalog items
      for (const item of itemsWithId) {
        if (item.productId) {
          await db.update(products)
            .set({
              stockQty: sql`COALESCE(${products.stockQty}, 0) + ${item.qty}`,
              costPrice: item.purchasePrice,
            })
            .where(eq(products.id, item.productId));
        }
      }
    }
    return newInvoice;
  }

  async getPurchaseInvoices(): Promise<(PurchaseInvoice & { itemCount: number })[]> {
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
      itemCount: sql<number>`COUNT(${purchaseInvoiceItems.id})::int`,
    })
      .from(purchaseInvoices)
      .leftJoin(purchaseInvoiceItems, eq(purchaseInvoiceItems.invoiceId, purchaseInvoices.id))
      .groupBy(purchaseInvoices.id)
      .orderBy(sql`${purchaseInvoices.id} DESC`);
    return result as any;
  }

  async getPurchaseInvoiceWithItems(id: number): Promise<{ invoice: PurchaseInvoice; items: PurchaseInvoiceItem[] } | null> {
    const [invoice] = await db.select().from(purchaseInvoices).where(eq(purchaseInvoices.id, id));
    if (!invoice) return null;
    const items = await db.select().from(purchaseInvoiceItems).where(eq(purchaseInvoiceItems.invoiceId, id));
    return { invoice, items };
  }

  async getProfitAnalytics() {
    // Total from all purchase invoices
    const [totals] = await db.select({
      totalCost: sql<string>`COALESCE(SUM(${purchaseInvoices.totalCost}), 0)::text`,
      totalSellingValue: sql<string>`COALESCE(SUM(${purchaseInvoices.totalSellingValue}), 0)::text`,
      totalProfit: sql<string>`COALESCE(SUM(${purchaseInvoices.totalProfit}), 0)::text`,
    }).from(purchaseInvoices);

    // Total revenue from completed orders
    const [revRow] = await db.select({
      totalRevenue: sql<string>`COALESCE(SUM(${orders.total}), 0)::text`,
    }).from(orders).where(eq(orders.status, 'completed'));

    // Per-product stats: purchased qty, sold qty from order_items
    const productRows = await db.select().from(products);

    const invoiceItemRows = await db.select({
      productId: purchaseInvoiceItems.productId,
      productName: purchaseInvoiceItems.productName,
      totalPurchased: sql<number>`SUM(${purchaseInvoiceItems.qty})::int`,
      totalCost: sql<string>`SUM(${purchaseInvoiceItems.purchasePrice}::numeric * ${purchaseInvoiceItems.qty})::text`,
      totalExpectedProfit: sql<string>`SUM(${purchaseInvoiceItems.profitPerUnit}::numeric * ${purchaseInvoiceItems.qty})::text`,
    })
      .from(purchaseInvoiceItems)
      .groupBy(purchaseInvoiceItems.productId, purchaseInvoiceItems.productName);

    const soldRows = await db.select({
      productId: orderItems.productId,
      totalSold: sql<number>`SUM(${orderItems.quantity})::int`,
    }).from(orderItems).groupBy(orderItems.productId);

    const soldMap: Record<number, number> = {};
    for (const row of soldRows) soldMap[row.productId] = row.totalSold;

    const productStats = invoiceItemRows.map(row => {
      const product = row.productId ? productRows.find(p => p.id === row.productId) : null;
      const stockQty = product?.stockQty ?? 0;
      const costPrice = parseFloat(product?.costPrice ?? "0") || 0;
      const sellingPrice = parseFloat(product?.price ?? "0") || 0;
      const profitPerUnit = sellingPrice - costPrice;
      const totalSold = row.productId ? (soldMap[row.productId] ?? 0) : 0;
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
        totalExpectedProfit: parseFloat(row.totalExpectedProfit ?? "0") || 0,
      };
    });

    return {
      totalPurchaseCost: parseFloat(totals?.totalCost ?? "0") || 0,
      totalSellingValue: parseFloat(totals?.totalSellingValue ?? "0") || 0,
      totalExpectedProfit: parseFloat(totals?.totalProfit ?? "0") || 0,
      totalRevenue: parseFloat(revRow?.totalRevenue ?? "0") || 0,
      productStats,
    };
  }

  async importInvoiceProducts(
    items: Array<{ name: string; brand?: string; size?: string; color?: string; finish?: string; qty: number; purchasePrice: number; sellingPrice: number; category: string }>,
    supplierName: string
  ): Promise<{ newProducts: Product[]; updatedProducts: Product[] }> {
    const allProducts = await this.getProducts();
    const newProductsList: Product[] = [];
    const updatedProductsList: Product[] = [];
    const seen = new Set<string>();

    for (const item of items) {
      const nameLower = item.name.toLowerCase().trim();
      if (seen.has(nameLower)) continue;
      seen.add(nameLower);

      const existing = allProducts.find(p => p.name.toLowerCase().trim() === nameLower);

      if (existing) {
        const updated = await this.updateProduct(existing.id, {
          stockQty: (existing.stockQty || 0) + item.qty,
          costPrice: String(item.purchasePrice),
        });
        updatedProductsList.push(updated);
      } else {
        const descParts = [item.brand, item.size, item.color, item.finish].filter(Boolean);
        const description = descParts.length > 0 ? descParts.join(' · ') : `Imported from ${supplierName}`;
        const newProduct = await this.createProduct({
          name: item.name,
          description,
          price: String(item.sellingPrice || item.purchasePrice),
          category: item.category,
          imageUrl: '',
          featured: false,
          stockQty: item.qty,
          costPrice: String(item.purchasePrice),
        });
        newProductsList.push(newProduct);
      }
    }

    return { newProducts: newProductsList, updatedProducts: updatedProductsList };
  }

  async seedServices(): Promise<void> {
    const existing = await db.select().from(services).limit(1);
    if (existing.length > 0) return;
    const seedData: InsertService[] = [
      { title: "Modern Bathroom Renovation", description: "Complete overhaul with premium marble tiles and rainfall shower.", type: "photo", imageUrl: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800" },
      { title: "Designer Kitchen Lighting", description: "Installation of custom pendant lights and smart LED strips.", type: "photo", imageUrl: "https://images.unsplash.com/photo-1556912177-c54844bdb962?auto=format&fit=crop&q=80&w=800" },
    ];
    await db.insert(services).values(seedData);
  }

  async seedProducts(): Promise<void> {
    const existing = await db.select().from(products).limit(1);
    if (existing.length > 0) return;
    const seedData: InsertProduct[] = [
      { name: "Premium Marble Floor Tiles", description: "Elegant white marble tiles with grey veining, perfect for living rooms.", price: "4500", category: "Tiles", imageUrl: "attached_assets/stock_images/premium_marble_floor_5df6a86a.jpg", featured: true },
      { name: "Ceramic Wall Tiles", description: "Textured ceramic tiles for bathrooms and kitchens.", price: "2500", category: "Tiles", imageUrl: "attached_assets/stock_images/ceramic_wall_tiles_b_dac2c109.jpg", featured: false },
      { name: "Modern Ceramic Basin", description: "Sleek countertop basin with a glossy finish.", price: "12000", category: "Washbasins", imageUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=800", featured: true },
      { name: "Classic Pedestal Sink", description: "Timeless design for traditional bathrooms.", price: "9500", category: "Washbasins", imageUrl: "attached_assets/stock_images/classic_pedestal_sin_d333865c.jpg", featured: false },
      { name: "Rainfall Shower Head", description: "Luxury 10-inch rainfall shower head in chrome finish.", price: "8500", category: "Showers", imageUrl: "attached_assets/stock_images/rainfall_shower_head_700cf018.jpg", featured: true },
      { name: "Stainless Steel Sink", description: "Double bowl kitchen sink, scratch resistant.", price: "15000", category: "Kitchen Fittings", imageUrl: "attached_assets/stock_images/stainless_steel_kitc_9a024fed.jpg", featured: true },
      { name: "Pull-Down Kitchen Faucet", description: "High-arc faucet with pull-down sprayer.", price: "11000", category: "Kitchen Fittings", imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800", featured: false },
      { name: "Smart LED Bulb", description: "WiFi enabled color changing bulb.", price: "1500", category: "Lighting", imageUrl: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800", featured: false },
      { name: "Modern Pendant Light", description: "Fancy hanging light for dining areas.", price: "7500", category: "Lighting", imageUrl: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=800", featured: true },
      { name: "Premium Digital Water Heater with Shower", description: "Advanced digital water heater featuring real-time temperature display and integrated shower system.", price: "20000", category: "Water Heaters", imageUrl: "/images/water-heater-shower.png", featured: false },
    ];
    await db.insert(products).values(seedData);
  }
}

export const storage = new DatabaseStorage();
