import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type Product, type Order, type Service, type StoreSettings, type Inquiry, type PurchaseInvoice, type PurchaseInvoiceItem } from "@shared/schema";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Plus, ShoppingCart, Package, BarChart3, Check, LogOut, Printer, Image as ImageIcon, Lock, Trash2, Images, Video, Settings, MessageCircle as MessageCircleIcon, Store as StoreIcon, Truck, FileText, RotateCcw, Upload, Pencil, X, ChevronDown, ChevronUp, Receipt, TrendingUp, IndianRupee, ArrowUpRight, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Sign in to access the dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                data-testid="input-admin-username"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                data-testid="input-admin-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p data-testid="text-login-error" className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              data-testid="button-admin-login"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

interface ManualItem {
  id: number;
  name: string;
  price: string;
  qty: number;
}

interface WholesalerEntry {
  id: number;
  name: string;
  items: ManualItem[];
}

function WholesalerTab({ products }: { products: Product[] }) {
  const { toast } = useToast();

  const makeDefaultWholesaler = (): WholesalerEntry => ({ id: Date.now(), name: "Wholesaler 1", items: [] });

  const [qtys, setQtys] = useState<Record<number, number>>({});
  const [wholePrices, setWholePrices] = useState<Record<number, string>>({});
  const [showCatalog, setShowCatalog] = useState(false);

  const [wholesalers, setWholesalers] = useState<WholesalerEntry[]>([makeDefaultWholesaler()]);
  const [activeId, setActiveId] = useState<number>(wholesalers[0].id);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [scanning, setScanning] = useState(false);

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newQty, setNewQty] = useState("");

  const activeWholesaler = wholesalers.find(w => w.id === activeId) ?? wholesalers[0];

  const addWholesaler = () => {
    const count = wholesalers.length + 1;
    const fresh: WholesalerEntry = { id: Date.now(), name: `Wholesaler ${count}`, items: [] };
    setWholesalers(prev => [...prev, fresh]);
    setActiveId(fresh.id);
  };

  const removeWholesaler = (id: number) => {
    if (wholesalers.length === 1) return;
    const remaining = wholesalers.filter(w => w.id !== id);
    setWholesalers(remaining);
    if (activeId === id) setActiveId(remaining[0].id);
  };

  const startEdit = (w: WholesalerEntry) => { setEditingId(w.id); setEditName(w.name); };
  const saveEdit = () => {
    if (!editName.trim()) { setEditingId(null); return; }
    setWholesalers(prev => prev.map(w => w.id === editingId ? { ...w, name: editName.trim() } : w));
    setEditingId(null);
  };

  const addItemTo = (wId: number, item: ManualItem) =>
    setWholesalers(prev => prev.map(w => w.id === wId ? { ...w, items: [...w.items, item] } : w));

  const removeItemFrom = (wId: number, iId: number) =>
    setWholesalers(prev => prev.map(w => w.id === wId ? { ...w, items: w.items.filter(i => i.id !== iId) } : w));

  const updateItem = (wId: number, iId: number, field: "name" | "price" | "qty", val: string) =>
    setWholesalers(prev => prev.map(w => w.id === wId ? {
      ...w,
      items: w.items.map(i => i.id === iId ? { ...i, [field]: field === "qty" ? parseInt(val) || 0 : val } : i),
    } : w));

  const addManualItem = () => {
    if (!newName.trim() || !newPrice || !newQty) return;
    addItemTo(activeId, { id: Date.now(), name: newName.trim(), price: newPrice, qty: parseInt(newQty) || 1 });
    setNewName(""); setNewPrice(""); setNewQty("");
  };

  const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScanning(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        const base64 = dataUrl.split(",")[1];
        const mimeType = file.type || "image/jpeg";
        try {
          const res = await fetch("/api/ai/scan-invoice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64, mimeType }),
          });
          const data = await res.json();
          if (!res.ok) {
            toast({ title: "Scan failed", description: data.message, variant: "destructive" });
          } else {
            const extracted: ManualItem[] = (data.items || []).map((item: any, idx: number) => ({
              id: Date.now() + idx,
              name: item.name || "Unknown item",
              price: String(item.price || 0),
              qty: Number(item.qty) || 1,
            }));
            if (extracted.length === 0) {
              toast({ title: "No items found", description: "Could not read items from this invoice.", variant: "destructive" });
            } else {
              setWholesalers(prev => prev.map(w => {
                if (w.id !== activeId) return w;
                const updatedName = data.supplier && w.name.startsWith("Wholesaler") ? data.supplier : w.name;
                return { ...w, name: updatedName, items: [...w.items, ...extracted] };
              }));
              toast({ title: `✅ ${extracted.length} item${extracted.length !== 1 ? "s" : ""} extracted`, description: data.supplier ? `Supplier: ${data.supplier}` : "Items added to list." });
            }
          }
        } catch {
          toast({ title: "Error", description: "Failed to scan invoice.", variant: "destructive" });
        }
        setScanning(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast({ title: "Error", description: "Failed to read file.", variant: "destructive" });
      setScanning(false);
    }
    e.target.value = "";
  };

  const catalogLines = products.filter(p => (qtys[p.id] || 0) > 0);
  const catalogTotal = catalogLines.reduce((sum, p) => {
    const wp = parseFloat(wholePrices[p.id] || p.price) || 0;
    return sum + wp * (qtys[p.id] || 0);
  }, 0);
  const wholesalerTotals = wholesalers.map(w => ({
    id: w.id, name: w.name,
    total: w.items.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * i.qty, 0),
  }));
  const allWholesalersTotal = wholesalerTotals.reduce((s, w) => s + w.total, 0);
  const grandTotal = catalogTotal + allWholesalersTotal;
  const totalLines = catalogLines.length + wholesalers.reduce((s, w) => s + w.items.length, 0);
  const activeTotal = wholesalerTotals.find(w => w.id === activeId)?.total ?? 0;

  const reset = () => {
    setQtys({}); setWholePrices({});
    const fresh = makeDefaultWholesaler();
    setWholesalers([fresh]);
    setActiveId(fresh.id);
  };

  const handlePrint = () => {
    if (totalLines === 0) return;
    let content = `TILES PALACE — WHOLESALE PURCHASE ORDER\n${"=".repeat(52)}\n\n`;
    if (catalogLines.length > 0) {
      content += `CATALOG PRODUCTS:\n${"-".repeat(40)}\n`;
      catalogLines.forEach(p => {
        const wp = parseFloat(wholePrices[p.id] || p.price) || 0;
        const qty = qtys[p.id] || 0;
        content += `${p.name} | Qty: ${qty} | ₹${wp.toLocaleString("en-IN")} | Total: ₹${(wp * qty).toLocaleString("en-IN")}\n`;
      });
      content += `Subtotal: ₹${catalogTotal.toLocaleString("en-IN")}\n\n`;
    }
    wholesalers.forEach(w => {
      if (w.items.length === 0) return;
      const wTotal = w.items.reduce((s, i) => s + (parseFloat(i.price) || 0) * i.qty, 0);
      content += `${w.name.toUpperCase()}:\n${"-".repeat(40)}\n`;
      w.items.forEach(i => {
        const price = parseFloat(i.price) || 0;
        content += `${i.name} | Qty: ${i.qty} | ₹${price.toLocaleString("en-IN")} | Total: ₹${(price * i.qty).toLocaleString("en-IN")}\n`;
      });
      content += `Subtotal: ₹${wTotal.toLocaleString("en-IN")}\n\n`;
    });
    content += `${"=".repeat(52)}\nGRAND TOTAL: ₹${grandTotal.toLocaleString("en-IN")}\n`;
    const win = window.open("", "_blank");
    if (win) { win.document.write(`<pre style="font-family:monospace;font-size:14px;padding:24px;">${content}</pre>`); win.print(); }
  };

  return (
    <div className="space-y-4">
      {/* Wholesaler Tabs + Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" /> Wholesale Purchase Manager
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
                <RotateCcw className="h-4 w-4" /> Reset All
              </Button>
              <Button size="sm" onClick={handlePrint} disabled={totalLines === 0} className="gap-1.5">
                <Printer className="h-4 w-4" /> Print Order
              </Button>
            </div>
          </div>

          {/* Wholesaler pill tabs */}
          <div className="flex items-center gap-2 flex-wrap mt-3">
            {wholesalers.map(w => (
              <div
                key={w.id}
                onClick={() => setActiveId(w.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors ${
                  activeId === w.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-accent border-border"
                }`}
              >
                {editingId === w.id ? (
                  <input
                    className="bg-transparent outline-none w-28 text-sm"
                    value={editName}
                    autoFocus
                    onChange={e => setEditName(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditingId(null); }}
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <span className="font-medium">{w.name}</span>
                    {w.items.length > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${activeId === w.id ? "bg-white/25 text-white" : "bg-primary/10 text-primary"}`}>
                        {w.items.length}
                      </span>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); startEdit(w); }}
                      className={`ml-0.5 hover:scale-110 transition-transform ${activeId === w.id ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground"}`}
                      title="Rename wholesaler"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    {wholesalers.length > 1 && (
                      <button
                        onClick={e => { e.stopPropagation(); removeWholesaler(w.id); }}
                        className={`hover:scale-110 transition-transform ${activeId === w.id ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-destructive"}`}
                        title="Remove wholesaler"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addWholesaler} className="h-8 rounded-full gap-1 border-dashed">
              <Plus className="h-3.5 w-3.5" /> Add Wholesaler
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Invoice upload */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-blue-500 flex-shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-900">Scan Invoice Bill</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Upload a photo of a bill/invoice — AI will read all items automatically for <strong>{activeWholesaler.name}</strong>
              </p>
            </div>
            <label className="flex-shrink-0 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInvoiceUpload}
                disabled={scanning}
                data-testid="input-invoice-upload"
              />
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                scanning
                  ? "border-blue-200 text-blue-400 bg-white cursor-not-allowed"
                  : "border-blue-300 text-blue-700 bg-white hover:bg-blue-50 cursor-pointer"
              }`}>
                {scanning ? (
                  <><span className="inline-block animate-spin">⏳</span> Scanning…</>
                ) : (
                  <><Upload className="h-4 w-4" /> Upload Invoice</>
                )}
              </div>
            </label>
          </div>

          {/* Manual add form */}
          <div className="flex gap-2 items-end p-3 bg-slate-50 rounded-lg border">
            <div className="flex-1 min-w-0 space-y-1">
              <Label className="text-xs text-muted-foreground">Item Name</Label>
              <Input
                placeholder="e.g. Italian Marble Tile"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addManualItem()}
                className="h-8 text-sm"
                data-testid="input-manual-name"
              />
            </div>
            <div className="w-28 space-y-1">
              <Label className="text-xs text-muted-foreground">Unit Price (₹)</Label>
              <Input
                type="number" min={0} placeholder="0"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
                className="h-8 text-sm"
                data-testid="input-manual-price"
              />
            </div>
            <div className="w-16 space-y-1">
              <Label className="text-xs text-muted-foreground">Qty</Label>
              <Input
                type="number" min={1} placeholder="1"
                value={newQty}
                onChange={e => setNewQty(e.target.value)}
                className="h-8 text-sm"
                data-testid="input-manual-qty"
              />
            </div>
            <Button size="sm" onClick={addManualItem} disabled={!newName.trim() || !newPrice || !newQty} className="gap-1 h-8" data-testid="button-add-manual">
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>

          {/* Items table for active wholesaler */}
          {activeWholesaler.items.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead className="w-32">Unit Price (₹)</TableHead>
                    <TableHead className="w-20">Qty</TableHead>
                    <TableHead className="text-right">Line Total</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeWholesaler.items.map(item => {
                    const price = parseFloat(item.price) || 0;
                    const lineTotal = price * item.qty;
                    return (
                      <TableRow key={item.id} className="bg-amber-50/60" data-testid={`wholesaler-item-${item.id}`}>
                        <TableCell>
                          <Input value={item.name} onChange={e => updateItem(activeId, item.id, "name", e.target.value)} className="h-8 text-sm" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" min={0} value={item.price} onChange={e => updateItem(activeId, item.id, "price", e.target.value)} className="h-8 text-sm" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" min={0} value={item.qty} onChange={e => updateItem(activeId, item.id, "qty", e.target.value)} className="h-8 text-sm" />
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm">₹{lineTotal.toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeItemFrom(activeId, item.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="flex justify-end text-sm pt-1 border-t">
                <span className="text-muted-foreground mr-2">{activeWholesaler.name} subtotal:</span>
                <span className="font-bold text-primary">₹{activeTotal.toLocaleString("en-IN")}</span>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Truck className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No items for <strong>{activeWholesaler.name}</strong> yet.</p>
              <p className="text-xs mt-1">Upload an invoice bill above or add items manually.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Catalog Products (collapsible) */}
      <Card>
        <CardHeader
          className="flex flex-row items-center justify-between cursor-pointer select-none py-3"
          onClick={() => setShowCatalog(v => !v)}
        >
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Store Catalog Products</span>
            {catalogLines.length > 0 && <Badge variant="secondary">{catalogLines.length} selected</Badge>}
          </div>
          <Button variant="ghost" size="sm" className="h-7 pointer-events-none gap-1">
            {showCatalog ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showCatalog ? "Hide" : "Show"}
          </Button>
        </CardHeader>
        {showCatalog && (
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-36">Wholesale Price (₹)</TableHead>
                  <TableHead className="w-28">Qty to Order</TableHead>
                  <TableHead className="text-right">Line Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(p => {
                  const wp = parseFloat(wholePrices[p.id] || "") || 0;
                  const qty = qtys[p.id] || 0;
                  const lineTotal = wp * qty;
                  return (
                    <TableRow key={p.id} data-testid={`wholesaler-row-${p.id}`} className={qty > 0 ? "bg-primary/5" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img src={p.imageUrl} alt={p.name} className="w-9 h-9 object-cover rounded border flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100"; }} />
                          <div>
                            <p className="font-medium text-sm leading-tight">{p.name}</p>
                            <p className="text-xs text-muted-foreground">Retail: ₹{parseFloat(p.price).toLocaleString("en-IN")}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{p.category}</TableCell>
                      <TableCell>
                        <Input type="number" min={0} placeholder={p.price} value={wholePrices[p.id] || ""}
                          onChange={e => setWholePrices(prev => ({ ...prev, [p.id]: e.target.value }))}
                          className="h-8 text-sm" data-testid={`input-wholesale-price-${p.id}`} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" min={0} value={qty || ""} placeholder="0"
                          onChange={e => setQtys(prev => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                          className="h-8 text-sm" data-testid={`input-wholesale-qty-${p.id}`} />
                      </TableCell>
                      <TableCell className="text-right font-semibold text-sm">
                        {lineTotal > 0 ? `₹${lineTotal.toLocaleString("en-IN")}` : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>

      {/* Grand Total */}
      <Card className={`border-2 ${grandTotal > 0 ? "border-primary bg-primary/5" : "border-border"}`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Purchase Order Total</p>
                <p className="text-sm text-muted-foreground">
                  {totalLines === 0 ? "No items yet" : `${totalLines} line item${totalLines !== 1 ? "s" : ""} across ${wholesalers.filter(w => w.items.length > 0).length + (catalogLines.length > 0 ? 1 : 0)} supplier${wholesalers.filter(w => w.items.length > 0).length + (catalogLines.length > 0 ? 1 : 0) !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Grand Total</p>
              <p className="text-2xl font-bold text-primary" data-testid="text-wholesale-grand-total">
                ₹{grandTotal.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          {(wholesalerTotals.some(w => w.total > 0) || catalogTotal > 0) && (
            <div className="flex flex-wrap justify-end gap-x-6 gap-y-1 mt-3 pt-2 border-t text-xs text-muted-foreground">
              {catalogTotal > 0 && <span>Catalog: ₹{catalogTotal.toLocaleString("en-IN")}</span>}
              {wholesalerTotals.filter(w => w.total > 0).map(w => (
                <span key={w.id}>{w.name}: ₹{w.total.toLocaleString("en-IN")}</span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface InvoiceLine {
  id: number;
  productId: string;
  productName: string;
  qty: string;
  purchasePrice: string;
  priceMode: "selling" | "profit";
  sellingPrice: string;
  profitInput: string;
}

function makeLine(): InvoiceLine {
  return { id: Date.now() + Math.random(), productId: "", productName: "", qty: "1", purchasePrice: "", priceMode: "selling", sellingPrice: "", profitInput: "" };
}

function calcLine(line: InvoiceLine) {
  const pp = parseFloat(line.purchasePrice) || 0;
  const qty = parseInt(line.qty) || 0;
  let sp = 0, profit = 0;
  if (line.priceMode === "selling") {
    sp = parseFloat(line.sellingPrice) || 0;
    profit = sp - pp;
  } else {
    profit = parseFloat(line.profitInput) || 0;
    sp = pp + profit;
  }
  return { pp, sp, profit, qty, totalCost: pp * qty, totalSelling: sp * qty, totalProfit: profit * qty };
}

function PurchasesTab({ products }: { products: Product[] }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [supplierName, setSupplierName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<InvoiceLine[]>([makeLine()]);
  const [submitting, setSubmitting] = useState(false);
  const [viewingId, setViewingId] = useState<number | null>(null);

  const { data: invoices, refetch } = useQuery<(PurchaseInvoice & { itemCount: number })[]>({
    queryKey: ["/api/admin/purchase-invoices"],
  });

  const { data: viewData } = useQuery<{ invoice: PurchaseInvoice; items: PurchaseInvoiceItem[] }>({
    queryKey: ["/api/admin/purchase-invoices", viewingId],
    enabled: viewingId !== null,
  });

  const addLine = () => setLines(prev => [...prev, makeLine()]);
  const removeLine = (id: number) => setLines(prev => prev.length > 1 ? prev.filter(l => l.id !== id) : prev);

  const updateLine = (id: number, field: keyof InvoiceLine, val: string) => {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: val };
      if (field === "productId" && val !== "") {
        const product = products.find(p => String(p.id) === val);
        if (product) {
          updated.productName = product.name;
          if (!updated.sellingPrice) updated.sellingPrice = product.price;
        }
      }
      return updated;
    }));
  };

  const totals = lines.reduce((acc, l) => {
    const c = calcLine(l);
    return { cost: acc.cost + c.totalCost, selling: acc.selling + c.totalSelling, profit: acc.profit + c.totalProfit };
  }, { cost: 0, selling: 0, profit: 0 });

  const resetForm = () => {
    setSupplierName(""); setInvoiceNumber(""); setInvoiceDate(new Date().toISOString().slice(0, 10));
    setNotes(""); setLines([makeLine()]); setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!supplierName.trim()) { toast({ title: "Supplier name required", variant: "destructive" }); return; }
    const validLines = lines.filter(l => l.productName.trim() && l.purchasePrice && l.qty);
    if (validLines.length === 0) { toast({ title: "Add at least one item", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const items = validLines.map(l => {
        const c = calcLine(l);
        return {
          productId: l.productId ? parseInt(l.productId) : null,
          productName: l.productName,
          qty: c.qty,
          purchasePrice: String(c.pp),
          sellingPrice: String(c.sp),
          profitPerUnit: String(c.profit),
        };
      });
      const res = await fetch("/api/admin/purchase-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice: {
            supplierName: supplierName.trim(),
            invoiceNumber: invoiceNumber.trim() || null,
            invoiceDate: invoiceDate || null,
            notes: notes.trim() || null,
            totalCost: String(totals.cost),
            totalSellingValue: String(totals.selling),
            totalProfit: String(totals.profit),
            createdAt: new Date().toISOString(),
          },
          items,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast({ title: "✅ Invoice saved", description: `${validLines.length} item${validLines.length !== 1 ? "s" : ""} recorded. Stock updated.` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/purchase-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics/profit"] });
      resetForm();
    } catch (err: any) {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" /> Purchase Invoices</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Record supplier invoices, track stock and profit.</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2" data-testid="button-new-invoice">
            <Plus className="h-4 w-4" /> Record New Invoice
          </Button>
        )}
      </div>

      {/* New Invoice Form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Receipt className="h-4 w-4 text-primary" /> New Purchase Invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Header fields */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs font-medium">Supplier / Wholesaler Name *</Label>
                <Input placeholder="e.g. Kerala Tiles Depot" value={supplierName} onChange={e => setSupplierName(e.target.value)} data-testid="input-supplier-name" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Invoice Number</Label>
                <Input placeholder="e.g. INV-2024-001" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-medium">Invoice Date</Label>
                <Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
              </div>
              <div className="col-span-2 md:col-span-4 space-y-1">
                <Label className="text-xs font-medium">Notes (optional)</Label>
                <Textarea placeholder="Any notes about this purchase..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="resize-none text-sm" />
              </div>
            </div>

            {/* Line items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold">Products Purchased</Label>
                <Button variant="outline" size="sm" onClick={addLine} className="gap-1 h-7 text-xs"><Plus className="h-3 w-3" /> Add Row</Button>
              </div>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="text-xs w-52">Product</TableHead>
                      <TableHead className="text-xs w-16">Qty</TableHead>
                      <TableHead className="text-xs w-32">Purchase Price (₹)</TableHead>
                      <TableHead className="text-xs w-28">
                        <div className="flex items-center gap-1">Price Mode</div>
                      </TableHead>
                      <TableHead className="text-xs w-32">Selling / Profit (₹)</TableHead>
                      <TableHead className="text-xs text-right">Profit/Unit</TableHead>
                      <TableHead className="text-xs text-right">Total Cost</TableHead>
                      <TableHead className="text-xs text-right">Total Profit</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map(line => {
                      const c = calcLine(line);
                      const profitColor = c.profit > 0 ? "text-green-600" : c.profit < 0 ? "text-red-500" : "text-muted-foreground";
                      return (
                        <TableRow key={line.id} className="align-top">
                          <TableCell className="py-2">
                            <Select value={line.productId} onValueChange={val => updateLine(line.id, "productId", val)}>
                              <SelectTrigger className="h-8 text-xs mb-1"><SelectValue placeholder="Select product..." /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manual">— Enter manually —</SelectItem>
                                {products.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            {(line.productId === "manual" || !line.productId) && (
                              <Input className="h-7 text-xs mt-1" placeholder="Product name" value={line.productName} onChange={e => updateLine(line.id, "productName", e.target.value)} />
                            )}
                          </TableCell>
                          <TableCell className="py-2">
                            <Input type="number" min={1} value={line.qty} onChange={e => updateLine(line.id, "qty", e.target.value)} className="h-8 text-sm w-14" />
                          </TableCell>
                          <TableCell className="py-2">
                            <Input type="number" min={0} placeholder="0" value={line.purchasePrice} onChange={e => updateLine(line.id, "purchasePrice", e.target.value)} className="h-8 text-sm" />
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex gap-1">
                              <Button size="sm" variant={line.priceMode === "selling" ? "default" : "outline"} className="h-7 text-xs px-2" onClick={() => updateLine(line.id, "priceMode", "selling")}>Sell ₹</Button>
                              <Button size="sm" variant={line.priceMode === "profit" ? "default" : "outline"} className="h-7 text-xs px-2" onClick={() => updateLine(line.id, "priceMode", "profit")}>Profit</Button>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            {line.priceMode === "selling" ? (
                              <Input type="number" min={0} placeholder="Selling price" value={line.sellingPrice} onChange={e => updateLine(line.id, "sellingPrice", e.target.value)} className="h-8 text-sm" />
                            ) : (
                              <Input type="number" placeholder="Profit per unit" value={line.profitInput} onChange={e => updateLine(line.id, "profitInput", e.target.value)} className="h-8 text-sm" />
                            )}
                          </TableCell>
                          <TableCell className={`py-2 text-right text-sm font-semibold ${profitColor}`}>
                            {c.pp > 0 && (c.sp > 0 || c.profit !== 0) ? fmt(c.profit) : "—"}
                          </TableCell>
                          <TableCell className="py-2 text-right text-sm font-medium">
                            {c.totalCost > 0 ? fmt(c.totalCost) : "—"}
                          </TableCell>
                          <TableCell className={`py-2 text-right text-sm font-semibold ${profitColor}`}>
                            {c.totalProfit !== 0 ? fmt(c.totalProfit) : "—"}
                          </TableCell>
                          <TableCell className="py-2">
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeLine(line.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Totals Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Purchase Cost</p>
                <p className="text-lg font-bold text-red-600">{fmt(totals.cost)}</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Total Selling Value</p>
                <p className="text-lg font-bold text-blue-600">{fmt(totals.selling)}</p>
              </div>
              <div className={`border rounded-lg p-3 text-center ${totals.profit >= 0 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
                <p className="text-xs text-muted-foreground mb-1">Total Expected Profit</p>
                <p className={`text-lg font-bold ${totals.profit >= 0 ? "text-green-600" : "text-red-600"}`}>{fmt(totals.profit)}</p>
                {totals.selling > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">{((totals.profit / totals.selling) * 100).toFixed(1)}% margin</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end border-t pt-4">
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
                {submitting ? "Saving…" : <><Check className="h-4 w-4" /> Save Invoice &amp; Update Stock</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Detail View */}
      {viewingId !== null && viewData && (
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">{viewData.invoice.supplierName}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {viewData.invoice.invoiceNumber && `Invoice: ${viewData.invoice.invoiceNumber} · `}
                {viewData.invoice.invoiceDate && `Date: ${viewData.invoice.invoiceDate} · `}
                {viewData.items.length} item{viewData.items.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setViewingId(null)}><X className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="w-16">Qty</TableHead>
                  <TableHead className="text-right">Purchase Price</TableHead>
                  <TableHead className="text-right">Selling Price</TableHead>
                  <TableHead className="text-right">Profit/Unit</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="text-right">Total Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewData.items.map(item => {
                  const pp = parseFloat(item.purchasePrice), sp = parseFloat(item.sellingPrice), profit = parseFloat(item.profitPerUnit);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-sm">{item.productName}</TableCell>
                      <TableCell>{item.qty}</TableCell>
                      <TableCell className="text-right">{fmt(pp)}</TableCell>
                      <TableCell className="text-right">{fmt(sp)}</TableCell>
                      <TableCell className={`text-right font-semibold ${profit >= 0 ? "text-green-600" : "text-red-500"}`}>{fmt(profit)}</TableCell>
                      <TableCell className="text-right">{fmt(pp * item.qty)}</TableCell>
                      <TableCell className={`text-right font-semibold ${profit >= 0 ? "text-green-600" : "text-red-500"}`}>{fmt(profit * item.qty)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t">
              <div className="text-center"><p className="text-xs text-muted-foreground">Total Cost</p><p className="font-bold text-red-600">{fmt(parseFloat(viewData.invoice.totalCost))}</p></div>
              <div className="text-center"><p className="text-xs text-muted-foreground">Selling Value</p><p className="font-bold text-blue-600">{fmt(parseFloat(viewData.invoice.totalSellingValue))}</p></div>
              <div className="text-center"><p className="text-xs text-muted-foreground">Expected Profit</p><p className="font-bold text-green-600">{fmt(parseFloat(viewData.invoice.totalProfit))}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Purchase History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Purchase History</CardTitle>
          <p className="text-sm text-muted-foreground">All saved invoices from suppliers</p>
        </CardHeader>
        <CardContent>
          {!invoices || invoices.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Receipt className="h-10 w-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm">No invoices recorded yet.</p>
              <p className="text-xs mt-1">Click "Record New Invoice" to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-16 text-center">Items</TableHead>
                  <TableHead className="text-right">Total Cost</TableHead>
                  <TableHead className="text-right">Expected Profit</TableHead>
                  <TableHead className="text-right">Recorded</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map(inv => (
                  <TableRow key={inv.id} data-testid={`invoice-row-${inv.id}`}>
                    <TableCell className="font-medium">{inv.supplierName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{inv.invoiceNumber || "—"}</TableCell>
                    <TableCell className="text-sm">{inv.invoiceDate || "—"}</TableCell>
                    <TableCell className="text-center"><Badge variant="secondary">{inv.itemCount}</Badge></TableCell>
                    <TableCell className="text-right font-semibold text-red-600">{fmt(parseFloat(inv.totalCost))}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">{fmt(parseFloat(inv.totalProfit))}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={() => setViewingId(viewingId === inv.id ? null : inv.id)}>
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState("inventory");
  const { toast } = useToast();

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: inquiriesList } = useQuery<Inquiry[]>({
    queryKey: ["/api/admin/inquiries"],
  });

  const { data: portfolioItems } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const { data: storeSettings } = useQuery<StoreSettings>({
    queryKey: ["/api/settings"],
  });

  const [settingsForm, setSettingsForm] = useState({
    whatsappNumber: "",
    storeName: "",
    storePhone: "",
    storeEmail: "",
    storeAddress: "",
  });

  const [settingsInitialized, setSettingsInitialized] = useState(false);

  if (storeSettings && !settingsInitialized) {
    setSettingsForm({
      whatsappNumber: storeSettings.whatsappNumber || "",
      storeName: storeSettings.storeName || "",
      storePhone: storeSettings.storePhone || "",
      storeEmail: storeSettings.storeEmail || "",
      storeAddress: storeSettings.storeAddress || "",
    });
    setSettingsInitialized(true);
  }

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: typeof settingsForm) => {
      await apiRequest("PATCH", "/api/admin/settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved!", description: "Store settings updated successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not save settings.", variant: "destructive" });
    },
  });

  const addPortfolioMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/services", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Portfolio item added" });
    },
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/services/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Portfolio item removed" });
    },
  });

  const { data: salesData } = useQuery<{ date: string; total: string; count: number }[]>({
    queryKey: ["/api/admin/analytics/daily-sales"],
  });

  const { data: monthlySalesData } = useQuery<{ month: string; total: string; count: number }[]>({
    queryKey: ["/api/admin/analytics/monthly-sales"],
  });

  const { data: profitData } = useQuery<{
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
  }>({
    queryKey: ["/api/admin/analytics/profit"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/admin/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product added successfully" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      await apiRequest("PATCH", `/api/admin/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "Product updated successfully" });
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics/daily-sales"] });
      toast({ title: "Order status updated" });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button
            variant="outline"
            onClick={onLogout}
            data-testid="button-admin-logout"
            className="flex gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-9 mb-8">
            <TabsTrigger value="inventory" className="flex gap-2">
              <Package className="h-4 w-4" /> Inventory
            </TabsTrigger>
            <TabsTrigger value="pos" className="flex gap-2">
              <ShoppingCart className="h-4 w-4" /> POS
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex gap-2">
              <Check className="h-4 w-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="flex gap-2 relative">
              <MessageCircleIcon className="h-4 w-4" /> Enquiries
              {inquiriesList && inquiriesList.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {inquiriesList.length > 9 ? "9+" : inquiriesList.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex gap-2">
              <Images className="h-4 w-4" /> Our Work
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex gap-2">
              <BarChart3 className="h-4 w-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="purchases" className="flex gap-2">
              <Receipt className="h-4 w-4" /> Purchases
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex gap-2">
              <Settings className="h-4 w-4" /> Settings
            </TabsTrigger>
            <TabsTrigger value="wholesaler" className="flex gap-2">
              <Truck className="h-4 w-4" /> Wholesaler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Products</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex gap-2">
                      <Plus className="h-4 w-4" /> Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <ProductForm
                      onSubmit={(data) => createProductMutation.mutate(data)}
                      isPending={createProductMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price (₹)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products?.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded" />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            defaultValue={product.price}
                            className="w-32"
                            onBlur={(e) => {
                              if (e.target.value !== product.price) {
                                updateProductMutation.mutate({
                                  id: product.id,
                                  data: { price: e.target.value },
                                });
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <ImageIcon className="h-4 w-4 mr-2" /> Edit Photo
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Product Photo</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Image URL</Label>
                                  <Input
                                    placeholder="Enter image URL"
                                    defaultValue={product.imageUrl}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        updateProductMutation.mutate({
                                          id: product.id,
                                          data: { imageUrl: e.currentTarget.value },
                                        });
                                      }
                                    }}
                                  />
                                  <p className="text-xs text-muted-foreground">Press Enter to save changes</p>
                                </div>
                                {product.imageUrl && (
                                  <div className="space-y-2">
                                    <Label>Preview</Label>
                                    <img
                                      src={product.imageUrl}
                                      alt="Preview"
                                      className="w-full h-40 object-cover rounded-md border"
                                    />
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pos">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {products?.map((p) => (
                      <Button
                        key={p.id}
                        variant="outline"
                        className="h-auto flex flex-col items-start p-4 gap-2"
                        onClick={() => toast({ title: "Added to cart", description: p.name })}
                      >
                        <img src={p.imageUrl} alt={p.name} className="w-full h-24 object-cover rounded" />
                        <span className="font-medium text-left line-clamp-1">{p.name}</span>
                        <span className="text-primary">₹{p.price}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Current Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-muted/50">
                      <p className="text-sm text-muted-foreground text-center">Cart is empty</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>₹0.00</span>
                      </div>
                      <Button className="w-full" size="lg">Complete Order</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders?.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{order.phone || "—"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{order.location || "—"}</TableCell>
                        <TableCell>₹{Number(order.total).toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <Badge variant={
                            order.status === "completed" ? "default" :
                            order.status === "cancelled" ? "destructive" : "secondary"
                          }>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.createdAt}</TableCell>
                        <TableCell className="flex gap-2">
                          {order.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: "completed" })}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateOrderStatusMutation.mutate({ id: order.id, status: "cancelled" })}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="outline"><Printer className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircleIcon className="h-5 w-5 text-primary" />
                  Customer Enquiries
                  {inquiriesList && inquiriesList.length > 0 && (
                    <Badge variant="secondary">{inquiriesList.length} total</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!inquiriesList || inquiriesList.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageCircleIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No enquiries yet</p>
                    <p className="text-sm">Customer enquiries from the website will appear here.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inquiriesList.map((inq) => (
                        <TableRow key={inq.id} data-testid={`row-inquiry-${inq.id}`}>
                          <TableCell className="text-muted-foreground">#{inq.id}</TableCell>
                          <TableCell className="font-medium">{inq.name}</TableCell>
                          <TableCell>
                            <a href={`mailto:${inq.email}`} className="text-primary hover:underline text-sm">
                              {inq.email}
                            </a>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {inq.phone ? (
                              <a href={`tel:${inq.phone}`} className="hover:underline">{inq.phone}</a>
                            ) : "—"}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm text-muted-foreground truncate" title={inq.message}>
                              {inq.message}
                            </p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Our Work — Portfolio</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex gap-2">
                      <Plus className="h-4 w-4" /> Add Photo / Video
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Portfolio Item</DialogTitle>
                    </DialogHeader>
                    <PortfolioForm
                      onSubmit={(data) => addPortfolioMutation.mutate(data)}
                      isPending={addPortfolioMutation.isPending}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolioItems?.map((item) => (
                    <div key={item.id} className="relative group rounded-xl overflow-hidden border bg-slate-50">
                      <div className="aspect-video bg-black relative">
                        {item.type === "video" && item.videoUrl ? (
                          <div className="w-full h-full flex items-center justify-center bg-slate-900">
                            <Video className="h-10 w-10 text-white/50" />
                            <span className="absolute bottom-2 left-2 text-xs text-white/70 bg-black/50 px-2 py-1 rounded">Video</span>
                          </div>
                        ) : (
                          <img
                            src={item.imageUrl || ""}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-semibold text-sm truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="secondary" className="text-xs capitalize">{item.type}</Badge>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 px-2"
                            onClick={() => deletePortfolioMutation.mutate(item.id)}
                            disabled={deletePortfolioMutation.isPending}
                            data-testid={`button-delete-portfolio-${item.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!portfolioItems?.length && (
                    <div className="col-span-full text-center py-16 text-muted-foreground border border-dashed rounded-xl">
                      No portfolio items yet. Add a photo or video above.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Today's Sales</p>
                  <p className="text-2xl font-bold text-primary">
                    ₹{Number(salesData?.[salesData.length - 1]?.total || 0).toLocaleString("en-IN")}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">This Month</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{Number(monthlySalesData?.[monthlySalesData.length - 1]?.total || 0).toLocaleString("en-IN")}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Today's Orders</p>
                  <p className="text-2xl font-bold text-green-600">
                    {salesData?.[salesData.length - 1]?.count || 0}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="pt-5 pb-4">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Monthly Orders</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {monthlySalesData?.[monthlySalesData.length - 1]?.count || 0}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Daily Sales Area Chart */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Daily Sales (₹)</CardTitle>
                  <p className="text-sm text-muted-foreground">Revenue from completed orders per day</p>
                </CardHeader>
                <CardContent>
                  {!salesData?.length ? (
                    <div className="h-[280px] flex items-center justify-center text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                      <div className="text-center">
                        <BarChart3 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No sales data yet. Complete some orders to see the graph.</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={salesData.map(d => ({ ...d, total: Number(d.total) }))} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} width={80} />
                        <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Sales"]} />
                        <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#salesGradient)" dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Monthly Sales + Orders Bar Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Monthly Revenue (₹)</CardTitle>
                  <p className="text-sm text-muted-foreground">Total sales per month</p>
                </CardHeader>
                <CardContent>
                  {!monthlySalesData?.length ? (
                    <div className="h-[260px] flex items-center justify-center text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                      <div className="text-center">
                        <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No monthly data yet.</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={monthlySalesData.map(d => ({ ...d, total: Number(d.total) }))} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`} width={80} />
                        <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
                        <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Orders Per Day</CardTitle>
                  <p className="text-sm text-muted-foreground">Number of completed orders daily</p>
                </CardHeader>
                <CardContent>
                  {!salesData?.length ? (
                    <div className="h-[260px] flex items-center justify-center text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                      <div className="text-center">
                        <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No order data yet.</p>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={salesData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.5} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip formatter={(v: any) => [v, "Orders"]} />
                        <Bar dataKey="count" fill="url(#ordersGradient)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Profit & Stock Analytics */}
            <div className="mt-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><TrendingUp className="h-5 w-5 text-green-600" /> Profit Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="border-l-4 border-l-red-400">
                    <CardContent className="pt-5 pb-4">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Total Purchase Cost</p>
                      <p className="text-2xl font-bold text-red-600">₹{(profitData?.totalPurchaseCost || 0).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-muted-foreground mt-1">All supplier invoices</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-5 pb-4">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Total Selling Value</p>
                      <p className="text-2xl font-bold text-blue-600">₹{(profitData?.totalSellingValue || 0).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-muted-foreground mt-1">At set selling prices</p>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="pt-5 pb-4">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Expected Profit</p>
                      <p className="text-2xl font-bold text-green-600">₹{(profitData?.totalExpectedProfit || 0).toLocaleString("en-IN")}</p>
                      {profitData && profitData.totalSellingValue > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">{((profitData.totalExpectedProfit / profitData.totalSellingValue) * 100).toFixed(1)}% gross margin</p>
                      )}
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="pt-5 pb-4">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Actual Revenue</p>
                      <p className="text-2xl font-bold text-primary">₹{(profitData?.totalRevenue || 0).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-muted-foreground mt-1">Completed orders</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Per-Product Profit Table */}
              {profitData && profitData.productStats.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><IndianRupee className="h-4 w-4 text-primary" /> Product Profit &amp; Stock</CardTitle>
                    <p className="text-sm text-muted-foreground">Based on purchase invoices recorded in the Purchases tab</p>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Cost Price</TableHead>
                          <TableHead className="text-right">Selling Price</TableHead>
                          <TableHead className="text-right">Profit/Unit</TableHead>
                          <TableHead className="text-right">Purchased</TableHead>
                          <TableHead className="text-right">Sold</TableHead>
                          <TableHead className="text-right">Stock Left</TableHead>
                          <TableHead className="text-right">Total Profit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profitData.productStats
                          .sort((a, b) => b.totalExpectedProfit - a.totalExpectedProfit)
                          .map((stat, i) => {
                            const marginPct = stat.sellingPrice > 0 ? ((stat.profitPerUnit / stat.sellingPrice) * 100).toFixed(1) : "0";
                            const profitColor = stat.profitPerUnit > 0 ? "text-green-600" : stat.profitPerUnit < 0 ? "text-red-500" : "text-muted-foreground";
                            return (
                              <TableRow key={i} data-testid={`profit-row-${stat.productId ?? i}`}>
                                <TableCell>
                                  <p className="font-medium text-sm">{stat.productName}</p>
                                  {i === 0 && <Badge variant="secondary" className="text-xs mt-0.5">⭐ Most Profitable</Badge>}
                                </TableCell>
                                <TableCell className="text-right text-sm">₹{stat.costPrice.toLocaleString("en-IN")}</TableCell>
                                <TableCell className="text-right text-sm">₹{stat.sellingPrice.toLocaleString("en-IN")}</TableCell>
                                <TableCell className={`text-right font-semibold text-sm ${profitColor}`}>
                                  ₹{stat.profitPerUnit.toLocaleString("en-IN")}
                                  <span className="text-xs text-muted-foreground ml-1">({marginPct}%)</span>
                                </TableCell>
                                <TableCell className="text-right text-sm">{stat.totalPurchased}</TableCell>
                                <TableCell className="text-right text-sm">{stat.totalSold}</TableCell>
                                <TableCell className="text-right">
                                  <span className={`font-semibold text-sm ${stat.stockQty <= 5 ? "text-orange-500" : "text-foreground"}`}>
                                    {stat.stockQty}
                                    {stat.stockQty <= 5 && stat.stockQty > 0 && <span className="text-xs ml-1">⚠️ Low</span>}
                                    {stat.stockQty === 0 && <span className="text-xs ml-1 text-red-500">Out</span>}
                                  </span>
                                </TableCell>
                                <TableCell className={`text-right font-bold text-sm ${profitColor}`}>
                                  ₹{stat.totalExpectedProfit.toLocaleString("en-IN")}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {(!profitData || profitData.productStats.length === 0) && (
                <Card className="border-dashed">
                  <CardContent className="py-10 text-center text-muted-foreground">
                    <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-25" />
                    <p className="text-sm font-medium">No profit data yet</p>
                    <p className="text-xs mt-1">Go to the <strong>Purchases</strong> tab and record your first supplier invoice to see profit analytics here.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="max-w-xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircleIcon className="h-5 w-5 text-green-600" />
                    WhatsApp Settings
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Set the seller's WhatsApp number. All order notifications will be sent here.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wa-number">Seller WhatsApp Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="wa-number"
                        data-testid="input-whatsapp-number"
                        placeholder="e.g. 919876543210 (with country code, no +)"
                        value={settingsForm.whatsappNumber}
                        onChange={(e) => setSettingsForm(f => ({ ...f, whatsappNumber: e.target.value }))}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the full number with country code — e.g. for India: <span className="font-mono font-semibold">919876543210</span>
                    </p>
                    {settingsForm.whatsappNumber && (
                      <a
                        href={`https://wa.me/${settingsForm.whatsappNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-green-600 hover:underline"
                        data-testid="link-test-whatsapp"
                      >
                        ✅ Test this number on WhatsApp ↗
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StoreIcon className="h-5 w-5 text-primary" />
                    Store Information
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    These details appear across the website and in customer messages.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Store Name</Label>
                    <Input
                      id="store-name"
                      data-testid="input-store-name"
                      placeholder="Tiles Palace"
                      value={settingsForm.storeName}
                      onChange={(e) => setSettingsForm(f => ({ ...f, storeName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-phone">Store Phone</Label>
                    <Input
                      id="store-phone"
                      data-testid="input-store-phone"
                      placeholder="+91 98765 43210"
                      value={settingsForm.storePhone}
                      onChange={(e) => setSettingsForm(f => ({ ...f, storePhone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-email">Store Email</Label>
                    <Input
                      id="store-email"
                      data-testid="input-store-email"
                      placeholder="info@tilespalace.com"
                      value={settingsForm.storeEmail}
                      onChange={(e) => setSettingsForm(f => ({ ...f, storeEmail: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-address">Store Address</Label>
                    <Input
                      id="store-address"
                      data-testid="input-store-address"
                      placeholder="Shop address"
                      value={settingsForm.storeAddress}
                      onChange={(e) => setSettingsForm(f => ({ ...f, storeAddress: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full h-12 text-base"
                onClick={() => saveSettingsMutation.mutate(settingsForm)}
                disabled={saveSettingsMutation.isPending}
                data-testid="button-save-settings"
              >
                {saveSettingsMutation.isPending ? "Saving…" : "Save Settings"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="purchases">
            <PurchasesTab products={products || []} />
          </TabsContent>

          <TabsContent value="wholesaler">
            <WholesalerTab products={products || []} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function Admin() {
  const { data: authData, isLoading: authLoading, refetch: refetchAuth } = useQuery<{ loggedIn: boolean }>({
    queryKey: ["/api/admin/me"],
  });

  const handleLogout = async () => {
    await apiRequest("POST", "/api/admin/logout", {});
    queryClient.clear();
    refetchAuth();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authData?.loggedIn) {
    return <AdminLogin onSuccess={() => refetchAuth()} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

function PortfolioForm({ onSubmit, isPending }: { onSubmit: (data: any) => void; isPending: boolean }) {
  const [type, setType] = useState<"photo" | "video">("photo");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ type, title, description, imageUrl: type === "photo" ? imageUrl : null, videoUrl: type === "video" ? videoUrl : null });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label>Type</Label>
        <div className="flex gap-3">
          <Button
            type="button"
            variant={type === "photo" ? "default" : "outline"}
            className="flex-1 flex gap-2"
            onClick={() => setType("photo")}
          >
            <ImageIcon className="h-4 w-4" /> Photo
          </Button>
          <Button
            type="button"
            variant={type === "video" ? "default" : "outline"}
            className="flex-1 flex gap-2"
            onClick={() => setType("video")}
          >
            <Video className="h-4 w-4" /> Video
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="portfolio-title">Title</Label>
        <Input
          id="portfolio-title"
          placeholder="e.g. Modern Bathroom Renovation"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="portfolio-desc">Description</Label>
        <Input
          id="portfolio-desc"
          placeholder="Brief description of the project"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      {type === "photo" ? (
        <div className="space-y-2">
          <Label htmlFor="portfolio-img">Image URL</Label>
          <Input
            id="portfolio-img"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />
          {imageUrl && (
            <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover rounded-md border mt-2" />
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="portfolio-video">Video URL</Label>
          <Input
            id="portfolio-video"
            placeholder="YouTube, Vimeo, or direct video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">Supports YouTube, Vimeo, and direct MP4 links.</p>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Adding..." : "Add to Portfolio"}
      </Button>
    </form>
  );
}

function ProductForm({ onSubmit, isPending }: { onSubmit: (data: any) => void; isPending: boolean }) {
  const form = useForm({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: "Tiles",
      imageUrl: "",
      featured: false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (₹)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Adding..." : "Add Product"}
        </Button>
      </form>
    </Form>
  );
}
