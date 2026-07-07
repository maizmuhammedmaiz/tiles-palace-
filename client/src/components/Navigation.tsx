import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, ShoppingCart, Trash2, Plus, Minus, X } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useQuery } from "@tanstack/react-query";
import type { StoreSettings } from "@shared/schema";

const links = [
  { href: "/", label: "Home" },
  { href: "/catalog", label: "Catalog" },
  { href: "/portfolio", label: "Our Work" },
  { href: "/contact", label: "Contact Us" },
  { href: "/admin", label: "Admin" },
];

function CartDrawer() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const [open, setOpen] = useState(false);
  const { data: settings } = useQuery<StoreSettings>({ queryKey: ["/api/settings"] });

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;
    const lines = items.map(
      i => `• ${i.name} x${i.quantity} — ₹${(parseFloat(i.price) * i.quantity).toLocaleString("en-IN")}`
    ).join("\n");
    const msg =
      `🛒 *Order from Tiles Palace*\n\n${lines}\n\n` +
      `💰 *Grand Total: ₹${totalPrice.toLocaleString("en-IN")}*\n\n` +
      `Please confirm my order.`;
    const waNum = settings?.whatsappNumber || "";
    window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative" data-testid="button-open-cart">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[420px] flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            My Cart {totalItems > 0 && <span className="text-sm font-normal text-muted-foreground">({totalItems} items)</span>}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <ShoppingCart className="h-16 w-16 opacity-20" />
            <p className="font-medium">Your cart is empty</p>
            <p className="text-sm">Add products from the catalog</p>
            <Button variant="outline" onClick={() => setOpen(false)} asChild>
              <Link href="/catalog">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map(item => (
                <div key={item.productId} className="flex gap-3 items-start" data-testid={`cart-item-${item.productId}`}>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg border flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-tight truncate">{item.name}</p>
                    <p className="text-primary font-bold text-sm mt-0.5">₹{parseFloat(item.price).toLocaleString("en-IN")}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-bold">₹{(parseFloat(item.price) * item.quantity).toLocaleString("en-IN")}</p>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeFromCart(item.productId)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t px-6 py-4 space-y-3 bg-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Subtotal</span>
                <span className="font-bold text-lg">₹{totalPrice.toLocaleString("en-IN")}</span>
              </div>
              <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold gap-2" onClick={handleWhatsAppCheckout} data-testid="button-cart-checkout">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Order via WhatsApp
              </Button>
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground gap-1" onClick={clearCart} data-testid="button-clear-cart">
                <Trash2 className="h-3.5 w-3.5" /> Clear cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tighter">
          <img src="/logo.png" alt="Tiles Palace" className="w-10 h-10 object-contain rounded-lg" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Tiles Palace
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 items-center">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <CartDrawer />
          <Button asChild size="sm" className="font-semibold shadow-md">
            <Link href="/catalog">Browse Collection</Link>
          </Button>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-2">
          <CartDrawer />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 mt-8">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-lg font-medium transition-colors hover:text-primary",
                      location === link.href ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Button asChild className="w-full mt-4">
                  <Link href="/catalog" onClick={() => setIsOpen(false)}>Browse Collection</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
