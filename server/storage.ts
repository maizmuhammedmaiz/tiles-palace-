import { products, inquiries, services, orders, orderItems, type Product, type InsertProduct, type Inquiry, type InsertInquiry, type Service, type InsertService, type Order, type InsertOrder, type OrderItem, type InsertOrderItem } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, sql } from "drizzle-orm";

export interface IStorage {
  getProducts(category?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getServices(): Promise<Service[]>;
  getOrders(): Promise<Order[]>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  getDailySales(): Promise<{ date: string; total: string; count: number }[]>;
  seedProducts(): Promise<void>;
  seedServices(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProducts(category?: string): Promise<Product[]> {
    if (category) {
      return await db.select().from(products).where(ilike(products.category, category));
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

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db.insert(inquiries).values(insertInquiry).returning();
    return inquiry;
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
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
    await db.insert(orderItems).values(itemsWithId);
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

  async seedServices(): Promise<void> {
    const existing = await db.select().from(services).limit(1);
    if (existing.length > 0) return;

    const seedData: InsertService[] = [
      {
        title: "Modern Bathroom Renovation",
        description: "Complete overhaul with premium marble tiles and rainfall shower.",
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800",
      },
      {
        title: "Designer Kitchen Lighting",
        description: "Installation of custom pendant lights and smart LED strips.",
        type: "photo",
        imageUrl: "https://images.unsplash.com/photo-1556912177-c54844bdb962?auto=format&fit=crop&q=80&w=800",
      }
    ];

    await db.insert(services).values(seedData);
  }

  async seedProducts(): Promise<void> {
    const existing = await db.select().from(products).limit(1);
    if (existing.length > 0) return;

    const seedData: InsertProduct[] = [
      // Tiles
      {
        name: "Premium Marble Floor Tiles",
        description: "Elegant white marble tiles with grey veining, perfect for living rooms.",
        price: "4500",
        category: "Tiles",
        imageUrl: "https://images.unsplash.com/photo-1596417767228-5ae0072d7331?auto=format&fit=crop&q=80&w=800",
        featured: true
      },
      {
        name: "Ceramic Wall Tiles",
        description: "Textured ceramic tiles for bathrooms and kitchens.",
        price: "2500",
        category: "Tiles",
        imageUrl: "https://images.unsplash.com/photo-1595861191062-811c751241f9?auto=format&fit=crop&q=80&w=800",
        featured: false
      },
      // Washbasins
      {
        name: "Modern Ceramic Basin",
        description: "Sleek countertop basin with a glossy finish.",
        price: "12000",
        category: "Washbasins",
        imageUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=800",
        featured: true
      },
      {
        name: "Classic Pedestal Sink",
        description: "Timeless design for traditional bathrooms.",
        price: "9500",
        category: "Washbasins",
        imageUrl: "https://images.unsplash.com/photo-1584620836301-8d3807d4b06c?auto=format&fit=crop&q=80&w=800",
        featured: false
      },
      // Showers
      {
        name: "Rainfall Shower Head",
        description: "Luxury 10-inch rainfall shower head in chrome finish.",
        price: "8500",
        category: "Showers",
        imageUrl: "https://images.unsplash.com/photo-1563293883-936d50ee515a?auto=format&fit=crop&q=80&w=800",
        featured: true
      },
      // Kitchen Fittings
      {
        name: "Stainless Steel Sink",
        description: "Double bowl kitchen sink, scratch resistant.",
        price: "15000",
        category: "Kitchen Fittings",
        imageUrl: "https://images.unsplash.com/photo-1588854337422-bc519c968434?auto=format&fit=crop&q=80&w=800",
        featured: true
      },
      {
        name: "Pull-Down Kitchen Faucet",
        description: "High-arc faucet with pull-down sprayer.",
        price: "11000",
        category: "Kitchen Fittings",
        imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
        featured: false
      },
      // Lighting
      {
        name: "Smart LED Bulb",
        description: "WiFi enabled color changing bulb.",
        price: "1500",
        category: "Lighting",
        imageUrl: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=800",
        featured: false
      },
      {
        name: "Modern Pendant Light",
        description: "Fancy hanging light for dining areas.",
        price: "7500",
        category: "Lighting",
        imageUrl: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=800",
        featured: true
      },
      {
        name: "Premium Digital Water Heater with Shower",
        description: "Advanced digital water heater featuring real-time temperature display and integrated shower system. Elegant white design with modern controls.",
        price: "20000",
        category: "Water Heaters",
        imageUrl: "/images/water-heater-shower.png",
        featured: false
      }
    ];

    await db.insert(products).values(seedData);
  }
}

export const storage = new DatabaseStorage();
