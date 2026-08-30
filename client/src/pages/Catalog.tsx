import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { AIPhotoScanner } from "@/components/AIPhotoScanner";
import { useProducts } from "@/hooks/use-products";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Sparkles, Camera, Search, X } from "lucide-react";

const categories = [
  { id: "all", label: "All Products" },
  { id: "tiles", label: "Tiles" },
  { id: "lighting", label: "Lighting" },
  { id: "kitchen", label: "Kitchen Fittings" },
  { id: "shower", label: "Bath & Showers" },
  { id: "washbasin", label: "Wash Basins" },
  { id: "water-heaters", label: "Water Heaters" },
];

export default function Catalog() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [, setLocation] = useLocation();

  const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      category: params.get("category") || "all",
      search: params.get("search") || "",
    };
  };

  const [activeCategory, setActiveCategory] = useState(getUrlParams().category);
  const [searchTerm, setSearchTerm] = useState(getUrlParams().search);

  // Sync state if URL changes
  useEffect(() => {
    const { category, search } = getUrlParams();
    setActiveCategory(category);
    if (search) setSearchTerm(search);
  }, []);

  const { data: allProducts, isLoading } = useProducts();

  const isCategoryMatch = (productCategory: string, selected: string) => {
    if (selected === "all") return true;
    const prod = (productCategory || "").toLowerCase();
    const sel = selected.toLowerCase();
    if (sel === "tiles") return prod.includes("tile");
    if (sel === "lighting") return prod.includes("light");
    if (sel === "kitchen") return prod.includes("kitchen");
    if (sel === "shower" || sel === "bath") return prod.includes("shower") || prod.includes("bath");
    if (sel === "washbasin" || sel === "basin") return prod.includes("basin") || prod.includes("washbasin") || prod.includes("sink");
    if (sel === "water-heaters" || sel === "heating") return prod.includes("heat") || prod.includes("geyser");
    return prod.includes(sel);
  };

  const products = allProducts?.filter(p => {
    const matchesCat = isCategoryMatch(p.category, activeCategory);
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    const params = new URLSearchParams();
    if (catId !== "all") params.set("category", catId);
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    const newSearch = params.toString();
    setLocation(`/catalog${newSearch ? `?${newSearch}` : ""}`, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      <div className="bg-slate-50 border-b">
        <div className="container px-4 py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-display font-bold mb-4">Our Collection</h1>
              <p className="text-muted-foreground max-w-2xl">
                Browse our extensive catalog of premium home fittings. Filter by category or use AI to find products from a photo.
              </p>
            </div>
            <Button
              onClick={() => setScannerOpen(true)}
              className="flex items-center gap-2 shrink-0 bg-primary/90 hover:bg-primary shadow-md"
              data-testid="button-ai-scanner"
            >
              <Camera className="h-4 w-4" />
              <Sparkles className="h-3.5 w-3.5" />
              Find by Photo (AI)
            </Button>
          </div>
        </div>
      </div>

      <AIPhotoScanner open={scannerOpen} onClose={() => setScannerOpen(false)} />

      <div className="container px-4 py-12 flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="font-display font-bold text-lg mb-4">Categories</h3>
              <div className="flex flex-row lg:flex-col overflow-x-auto pb-3 lg:pb-0 gap-2 no-scrollbar touch-pan-x -mx-4 px-4 lg:mx-0 lg:px-0">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={activeCategory === cat.id ? "default" : "ghost"}
                    className={cn(
                      "justify-start font-semibold rounded-full lg:rounded-md px-4 py-2 text-sm shrink-0 touch-manipulation cursor-pointer transition-all",
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-slate-100 lg:bg-transparent text-slate-700 hover:bg-slate-200 lg:hover:bg-slate-100"
                    )}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 rounded-xl border">
              <h4 className="font-bold mb-2">Need Help?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Our design experts can help you choose the right materials for your project.
              </p>
              <Button variant="outline" className="w-full bg-white" asChild>
                <a href="/contact">Contact Support</a>
              </Button>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-grow">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-[380px] space-y-4">
                  <Skeleton className="h-[240px] w-full rounded-xl" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search in catalog..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      const params = new URLSearchParams();
                      if (activeCategory !== "all") params.set("category", activeCategory);
                      if (e.target.value.trim()) params.set("search", e.target.value.trim());
                      const q = params.toString();
                      setLocation(`/catalog${q ? `?${q}` : ""}`, { replace: true });
                    }}
                    className="pl-9 pr-8 h-10 text-sm bg-white"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        const params = new URLSearchParams();
                        if (activeCategory !== "all") params.set("category", activeCategory);
                        const q = params.toString();
                        setLocation(`/catalog${q ? `?${q}` : ""}`, { replace: true });
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="text-sm font-medium text-muted-foreground self-center">
                  Showing <strong className="text-foreground font-bold">{products?.length || 0}</strong> products
                </div>
              </div>
              
              {products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed">
                  <h3 className="text-xl font-bold text-muted-foreground mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search terms or category filter.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActiveCategory("all");
                      setSearchTerm("");
                      setLocation("/catalog", { replace: true });
                    }}
                  >
                    View All Products
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
