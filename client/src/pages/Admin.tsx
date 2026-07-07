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
import { insertProductSchema, type Product, type Order, type Service, type StoreSettings, type Inquiry } from "@shared/schema";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Plus, ShoppingCart, Package, BarChart3, Check, LogOut, Printer, Image as ImageIcon, Lock, Trash2, Images, Video, Settings, MessageCircle as MessageCircleIcon, Store as StoreIcon, Truck, FileText, RotateCcw } from "lucide-react";
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

function WholesalerTab({ products }: { products: Product[] }) {
  const [qtys, setQtys] = useState<Record<number, number>>({});
  const [wholePrices, setWholePrices] = useState<Record<number, string>>({});
  const [manualItems, setManualItems] = useState<ManualItem[]>([]);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newQty, setNewQty] = useState("");
  const [showManual, setShowManual] = useState(false);

  const setQty = (id: number, val: number) =>
    setQtys(prev => ({ ...prev, [id]: Math.max(0, val) }));
  const setWPrice = (id: number, val: string) =>
    setWholePrices(prev => ({ ...prev, [id]: val }));

  const addManualItem = () => {
    if (!newName.trim() || !newPrice || !newQty) return;
    setManualItems(prev => [...prev, {
      id: Date.now(),
      name: newName.trim(),
      price: newPrice,
      qty: parseInt(newQty) || 1,
    }]);
    setNewName("");
    setNewPrice("");
    setNewQty("");
  };

  const removeManualItem = (id: number) =>
    setManualItems(prev => prev.filter(i => i.id !== id));

  const updateManualItem = (id: number, field: "name" | "price" | "qty", val: string) =>
    setManualItems(prev => prev.map(i => i.id === id ? { ...i, [field]: field === "qty" ? parseInt(val) || 0 : val } : i));

  const reset = () => { setQtys({}); setWholePrices({}); setManualItems([]); };

  const catalogLines = products.filter(p => (qtys[p.id] || 0) > 0);
  const catalogTotal = catalogLines.reduce((sum, p) => {
    const wp = parseFloat(wholePrices[p.id] || p.price) || 0;
    return sum + wp * (qtys[p.id] || 0);
  }, 0);
  const manualTotal = manualItems.reduce((sum, i) => sum + (parseFloat(i.price) || 0) * i.qty, 0);
  const grandTotal = catalogTotal + manualTotal;
  const totalLines = catalogLines.length + manualItems.length;

  const handlePrint = () => {
    if (totalLines === 0) return;
    const catRows = catalogLines.map(p => {
      const wp = parseFloat(wholePrices[p.id] || p.price) || 0;
      const qty = qtys[p.id] || 0;
      return `${p.name} | Qty: ${qty} | Price: ₹${wp.toLocaleString("en-IN")} | Total: ₹${(wp * qty).toLocaleString("en-IN")}`;
    });
    const manRows = manualItems.map(i => {
      const price = parseFloat(i.price) || 0;
      return `${i.name} (Manual) | Qty: ${i.qty} | Price: ₹${price.toLocaleString("en-IN")} | Total: ₹${(price * i.qty).toLocaleString("en-IN")}`;
    });
    const all = [...catRows, ...manRows].join("\n");
    const content = `TILES PALACE — WHOLESALE ORDER\n${"=".repeat(48)}\n\n${all}\n\n${"=".repeat(48)}\nGRAND TOTAL: ₹${grandTotal.toLocaleString("en-IN")}\n`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(`<pre style="font-family:monospace;font-size:14px;padding:24px;">${content}</pre>`); w.print(); }
  };

  return (
    <div className="space-y-4">
      {/* Catalog Products Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" /> Wholesaler Purchase List
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Set quantities and wholesale prices for your purchase order.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
              <RotateCcw className="h-4 w-4" /> Reset All
            </Button>
            <Button size="sm" onClick={handlePrint} disabled={totalLines === 0} className="gap-1.5">
              <Printer className="h-4 w-4" /> Print Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-10 h-10 object-cover rounded border flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100"; }}
                        />
                        <div>
                          <p className="font-medium text-sm leading-tight">{p.name}</p>
                          <p className="text-xs text-muted-foreground">Retail: ₹{parseFloat(p.price).toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.category}</TableCell>
                    <TableCell>
                      <Input
                        type="number" min={0} placeholder={p.price}
                        value={wholePrices[p.id] || ""}
                        onChange={e => setWPrice(p.id, e.target.value)}
                        className="h-8 text-sm"
                        data-testid={`input-wholesale-price-${p.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number" min={0} value={qty || ""} placeholder="0"
                        onChange={e => setQty(p.id, parseInt(e.target.value) || 0)}
                        className="h-8 text-sm"
                        data-testid={`input-wholesale-qty-${p.id}`}
                      />
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
      </Card>

      {/* Manual Items Section */}
      <Card>
        <CardHeader
          className="flex flex-row items-center justify-between cursor-pointer select-none"
          onClick={() => setShowManual(v => !v)}
        >
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4 text-primary" /> Manual Items
              {manualItems.length > 0 && (
                <Badge variant="secondary">{manualItems.length} item{manualItems.length !== 1 ? "s" : ""}</Badge>
              )}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">Add custom items not in your product catalog.</p>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 pointer-events-none">
            {showManual ? "Hide ▲" : "Show ▼"}
          </Button>
        </CardHeader>

        {showManual && (
          <CardContent className="space-y-4">
            {/* Add new item form */}
            <div className="flex gap-2 items-end p-3 bg-slate-50 rounded-lg border">
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Item Name</Label>
                <Input
                  placeholder="e.g. Italian Marble Tile"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="h-8 text-sm"
                  data-testid="input-manual-name"
                  onKeyDown={e => e.key === "Enter" && addManualItem()}
                />
              </div>
              <div className="w-32 space-y-1">
                <Label className="text-xs">Unit Price (₹)</Label>
                <Input
                  type="number" min={0} placeholder="0"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  className="h-8 text-sm"
                  data-testid="input-manual-price"
                />
              </div>
              <div className="w-20 space-y-1">
                <Label className="text-xs">Qty</Label>
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

            {/* Manual items list */}
            {manualItems.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead className="w-36">Unit Price (₹)</TableHead>
                    <TableHead className="w-24">Qty</TableHead>
                    <TableHead className="text-right">Line Total</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manualItems.map(item => {
                    const price = parseFloat(item.price) || 0;
                    const lineTotal = price * item.qty;
                    return (
                      <TableRow key={item.id} className="bg-amber-50" data-testid={`manual-row-${item.id}`}>
                        <TableCell>
                          <Input
                            value={item.name}
                            onChange={e => updateManualItem(item.id, "name", e.target.value)}
                            className="h-8 text-sm font-medium"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number" min={0}
                            value={item.price}
                            onChange={e => updateManualItem(item.id, "price", e.target.value)}
                            className="h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number" min={1}
                            value={item.qty}
                            onChange={e => updateManualItem(item.id, "qty", e.target.value)}
                            className="h-8 text-sm"
                          />
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm">
                          ₹{lineTotal.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeManualItem(item.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {manualItems.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">No manual items added yet. Use the form above to add items.</p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Grand Total Card */}
      <Card className={`border-2 ${grandTotal > 0 ? "border-primary bg-primary/5" : "border-border"}`}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Purchase Order Summary</p>
                <p className="text-sm text-muted-foreground">
                  {catalogLines.length > 0 && `${catalogLines.length} catalog item${catalogLines.length !== 1 ? "s" : ""}`}
                  {catalogLines.length > 0 && manualItems.length > 0 && " + "}
                  {manualItems.length > 0 && `${manualItems.length} manual item${manualItems.length !== 1 ? "s" : ""}`}
                  {totalLines === 0 && "No items selected"}
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
          {catalogLines.length > 0 && manualItems.length > 0 && (
            <div className="flex justify-end gap-6 mt-2 pt-2 border-t text-xs text-muted-foreground">
              <span>Catalog: ₹{catalogTotal.toLocaleString("en-IN")}</span>
              <span>Manual: ₹{manualTotal.toLocaleString("en-IN")}</span>
            </div>
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
          <TabsList className="grid w-full grid-cols-8 mb-8">
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
