import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { AIPhotoScanner } from "@/components/AIPhotoScanner";
import { useProducts } from "@/hooks/use-products";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Sparkles, Camera } from "lucide-react";

const categories = [
  { id: "all", label: "All Products" },
  { id: "tiles", label: "Tiles" },
  { id: "lighting", label: "Lighting" },
  { id: "kitchen", label: "Kitchen" },
  { id: "shower", label: "Bath & Shower" },
  { id: "washbasin", label: "Wash Basins" },
  { id: "heating", label: "Heating" },
];

export default function Catalog() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const activeCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";

  // Pass undefined if 'all' is selected to fetch everything
  const { data: allProducts, isLoading } = useProducts(
    activeCategory === "all" ? undefined : activeCategory
  );

  const products = allProducts?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategoryChange = (catId: string) => {
    if (catId === "all") {
      setLocation("/catalog");
    } else {
      setLocation(`/catalog?category=${catId}`);
    }
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
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={activeCategory === cat.id ? "default" : "ghost"}
                    className={cn(
                      "justify-start font-medium",
                      activeCategory === cat.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
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
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm text-muted-foreground">
                  Showing {products?.length || 0} results
                </span>
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
                  <p className="text-muted-foreground">Try selecting a different category.</p>
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
