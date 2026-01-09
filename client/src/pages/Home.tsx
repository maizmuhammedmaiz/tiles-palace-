import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

export default function Home() {
  const { data: featuredProducts, isLoading } = useProducts();
  
  // Filter for featured items manually if backend doesn't support specific filter yet
  // In a real app, I'd pass ?featured=true to the hook
  const displayProducts = featuredProducts?.filter(p => p.featured).slice(0, 4) || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Unsplash: modern minimal bathroom interior with tiles */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=2000" 
            alt="Modern Bathroom" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/40" />
        </div>
        
        <div className="container relative z-10 px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight"
          >
            Welcome to <br/> Tiles Palace
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-10"
          >
            Transform your home with our premium collection of tiles, lighting, and bathroom essentials. Designed for luxury, built for life.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="text-lg px-8 h-12 bg-white text-primary hover:bg-slate-100">
              <Link href="/catalog">Shop Collection</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 h-12 border-white text-white hover:bg-white/10 hover:text-white">
              <Link href="/contact">Book Consultation</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 md:py-24 bg-slate-50">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-4">Curated Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Explore our wide range of premium home fittings, from italian tiles to smart lighting solutions.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Unsplash images for categories */}
            <CategoryCard 
              title="Premium Tiles" 
              slug="tiles"
              image="https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800" 
              delay={0}
            />
            <CategoryCard 
              title="Modern Lighting" 
              slug="lighting"
              image="https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=800" 
              delay={0.1}
            />
            <CategoryCard 
              title="Kitchen Fittings" 
              slug="kitchen"
              image="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800" 
              delay={0.2}
            />
            <CategoryCard 
              title="Shower & Bath" 
              slug="shower"
              image="https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80&w=800" 
              delay={0.3}
            />
            <CategoryCard 
              title="Wash Basins" 
              slug="washbasin"
              image="https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&q=80&w=800" 
              delay={0.4}
            />
            <CategoryCard 
              title="Water Heaters" 
              slug="water-heaters"
              image="/images/water-heater-shower.png" 
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-24">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <div className="flex items-center gap-2 text-accent font-semibold mb-2">
                <Star className="w-5 h-5 fill-current" />
                <span>Featured Collection</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900">Trending Now</h2>
            </div>
            <Button asChild variant="ghost" className="group">
              <Link href="/catalog" className="flex items-center gap-2 text-primary font-semibold">
                View All Products <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[400px] bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayProducts.length > 0 ? displayProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              )) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No featured products available at the moment.
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
