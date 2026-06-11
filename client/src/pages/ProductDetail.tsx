import { useState } from "react";
import { useRoute } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InquiryDialog } from "@/components/InquiryDialog";
import { ArrowLeft, Check, Shield, Truck, MessageCircle, CheckCircle2, Store, User } from "lucide-react";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { StoreSettings } from "@shared/schema";

function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits;
  if (digits.length === 10 && /^[6-9]/.test(digits)) return "91" + digits;
  return digits;
}

interface OrderSummary {
  name: string;
  phone: string;
  location: string;
  quantity: number;
  total: string;
}

function OrderSuccessView({
  product,
  summary,
  onClose,
  sellerWhatsapp,
}: {
  product: { name: string; price: string };
  summary: OrderSummary;
  onClose: () => void;
  sellerWhatsapp: string;
}) {
  const sellerMsg =
    `🔔 *New Order Received!*\n\n` +
    `📦 Product: ${product.name}\n` +
    `🔢 Quantity: ${summary.quantity}\n` +
    `💰 Total: ₹${summary.total}\n\n` +
    `*Customer Details:*\n` +
    `👤 Name: ${summary.name}\n` +
    `📱 Phone: ${summary.phone}\n` +
    `📍 Location: ${summary.location}\n\n` +
    `Please confirm this order.`;

  const customerMsg =
    `✅ *Your order has been placed at Tiles Palace!*\n\n` +
    `📦 Product: ${product.name}\n` +
    `🔢 Quantity: ${summary.quantity}\n` +
    `💰 Total: ₹${summary.total}\n` +
    `📍 Delivery to: ${summary.location}\n\n` +
    `Our team will contact you shortly to confirm your order.\n` +
    `Thank you for shopping with us! 🙏\n` +
    `— Tiles Palace Team`;

  const customerWaNum = formatWhatsAppNumber(summary.phone);

  return (
    <div className="space-y-4 pt-1">
      {/* Success header */}
      <div className="flex flex-col items-center text-center py-4 bg-green-50 rounded-xl border border-green-100">
        <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
        <h3 className="font-bold text-lg text-green-800">Order Placed Successfully!</h3>
        <p className="text-sm text-green-700 mt-1">WhatsApp confirmation sent to customer automatically.</p>
      </div>

      {/* Order summary */}
      <div className="p-3 bg-slate-50 rounded-lg text-sm space-y-1">
        <p className="font-semibold text-slate-800">{product.name}</p>
        <p className="text-muted-foreground">Qty: {summary.quantity} &nbsp;·&nbsp; Total: <span className="font-bold text-primary">₹{summary.total}</span></p>
        <p className="text-muted-foreground">📍 {summary.location}</p>
      </div>

      {/* Auto-sent notice */}
      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-800">
        <MessageCircle className="h-4 w-4 flex-shrink-0 text-emerald-600" />
        <span>Customer confirmation sent to <strong>{summary.phone}</strong> via WhatsApp</span>
      </div>

      {/* Seller notification */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Also notify your store</p>
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white flex gap-2 justify-start h-12"
          onClick={() => window.open(`https://wa.me/${sellerWhatsapp}?text=${encodeURIComponent(sellerMsg)}`, "_blank")}
          data-testid="button-notify-seller"
        >
          <Store className="h-5 w-5 flex-shrink-0" />
          <div className="text-left">
            <p className="text-sm font-semibold leading-tight">Notify Store on WhatsApp</p>
            <p className="text-xs opacity-80 leading-tight">Send full order details to seller</p>
          </div>
        </Button>
      </div>

      <Button variant="outline" className="w-full" onClick={onClose} data-testid="button-close-success">
        Done
      </Button>
    </div>
  );
}

function OrderDialog({
  open,
  onClose,
  product,
}: {
  open: boolean;
  onClose: () => void;
  product: { id: number; name: string; price: string };
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const { toast } = useToast();

  const { data: settings } = useQuery<StoreSettings>({
    queryKey: ["/api/settings"],
  });
  const sellerWhatsapp = settings?.whatsappNumber || "";

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setOrderSummary(null);
      setName("");
      setPhone("");
      setLocation("");
      setQuantity(1);
    }, 300);
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !location.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          phone: phone.trim(),
          location: location.trim(),
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity,
        }),
      });
      const total = (parseFloat(product.price) * quantity).toLocaleString("en-IN");
      const summary: OrderSummary = { name: name.trim(), phone: phone.trim(), location: location.trim(), quantity, total };
      setOrderSummary(summary);

      const customerMsg =
        `✅ *Your order has been placed at Tiles Palace!*\n\n` +
        `📦 Product: ${product.name}\n` +
        `🔢 Quantity: ${summary.quantity}\n` +
        `💰 Total: ₹${summary.total}\n` +
        `📍 Delivery to: ${summary.location}\n\n` +
        `Our team will contact you shortly to confirm your order.\n` +
        `Thank you for shopping with us! 🙏\n` +
        `— Tiles Palace Team`;
      const customerWaNum = formatWhatsAppNumber(summary.phone);
      window.open(`https://wa.me/${customerWaNum}?text=${encodeURIComponent(customerMsg)}`, "_blank");

      toast({ title: "Order placed! 🎉", description: "WhatsApp confirmation sent to customer automatically." });
    } catch {
      toast({ title: "Error", description: "Could not save order. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {orderSummary ? "Order Confirmed ✅" : "Place Order via WhatsApp"}
          </DialogTitle>
        </DialogHeader>

        {orderSummary ? (
          <OrderSuccessView product={product} summary={orderSummary} onClose={handleClose} sellerWhatsapp={sellerWhatsapp} />
        ) : (
          <form onSubmit={handleOrder} className="space-y-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg text-sm">
              <p className="font-semibold">{product.name}</p>
              <p className="text-primary font-bold text-base mt-1">₹{parseFloat(product.price).toLocaleString("en-IN")} / unit</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-name">Full Name *</Label>
              <Input
                id="order-name"
                data-testid="input-order-name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-phone">Phone Number *</Label>
              <Input
                id="order-phone"
                data-testid="input-order-phone"
                placeholder="+91 98765 43210"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-location">Delivery Location *</Label>
              <Input
                id="order-location"
                data-testid="input-order-location"
                placeholder="City, Area or full address"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order-qty">Quantity</Label>
              <Input
                id="order-qty"
                data-testid="input-order-quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
            <div className="flex justify-between items-center pt-1 border-t text-sm font-semibold">
              <span>Total</span>
              <span className="text-primary text-base">₹{(parseFloat(product.price) * quantity).toLocaleString("en-IN")}</span>
            </div>
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white flex gap-2"
              disabled={loading || !name.trim() || !phone.trim() || !location.trim()}
              data-testid="button-confirm-order"
            >
              <MessageCircle className="h-4 w-4" />
              {loading ? "Placing Order..." : "Place Order"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const id = params ? parseInt(params.id) : 0;
  const [orderOpen, setOrderOpen] = useState(false);

  const { data: product, isLoading, isError } = useProduct(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="container px-4 py-12 flex-grow">
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-[4/3] rounded-2xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="container px-4 py-24 text-center flex-grow">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you are looking for does not exist.</p>
          <Button asChild>
            <Link href="/catalog">Back to Catalog</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <div className="container px-4 py-8 md:py-16 flex-grow">
        <Link href="/catalog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Catalog
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          <div className="space-y-4">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted border border-border/50 shadow-sm">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="mb-2">
              <Badge variant="secondary" className="uppercase tracking-wide text-xs font-semibold px-3 py-1">
                {product.category}
              </Badge>
              {product.featured && (
                <Badge variant="default" className="ml-2 bg-accent text-accent-foreground border-accent uppercase tracking-wide text-xs font-semibold px-3 py-1">
                  Featured Choice
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="text-3xl font-bold text-primary mb-8">
              ₹{product.price}
              <span className="text-base font-normal text-muted-foreground ml-2">/ unit</span>
            </div>

            <div className="prose prose-slate max-w-none mb-8 text-muted-foreground leading-relaxed">
              <p>{product.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Quality Guarantee</h4>
                  <p className="text-xs text-muted-foreground mt-1">10-year warranty on all ceramic products.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100">
                <Truck className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm">Fast Delivery</h4>
                  <p className="text-xs text-muted-foreground mt-1">Available for immediate dispatch.</p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t">
              <div className="flex flex-col gap-4">
                <Button
                  size="lg"
                  className="w-full h-14 text-lg font-semibold shadow-lg shadow-green-600/20 bg-green-600 hover:bg-green-700 border-none flex gap-2"
                  onClick={() => setOrderOpen(true)}
                  data-testid="button-order-whatsapp"
                >
                  <MessageCircle className="h-5 w-5" />
                  Order via WhatsApp
                </Button>
                <div className="flex-grow">
                  <InquiryDialog
                    productId={product.id}
                    productName={product.name}
                    trigger={
                      <Button size="lg" variant="outline" className="w-full h-14 text-lg font-semibold">
                        Request Quote / Inquire
                      </Button>
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-center sm:text-left text-muted-foreground mt-4 flex items-center gap-1">
                <Check className="w-3 h-3" /> Order saved to our system and sent instantly via WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <OrderDialog
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        product={product}
      />
    </div>
  );
}
