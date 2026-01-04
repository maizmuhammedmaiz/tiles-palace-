import { useRoute } from "wouter";
import { useProduct } from "@/hooks/use-products";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InquiryDialog } from "@/components/InquiryDialog";
import { ArrowLeft, Check, Shield, Truck } from "lucide-react";
import { Link } from "wouter";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const id = params ? parseInt(params.id) : 0;
  
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
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted border border-border/50 shadow-sm">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Product Info */}
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
              ${product.price}
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
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                   <InquiryDialog 
                     productId={product.id} 
                     productName={product.name}
                     trigger={
                       <Button size="lg" className="w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                         Request Quote / Inquire
                       </Button>
                     }
                   />
                </div>
              </div>
              <p className="text-xs text-center sm:text-left text-muted-foreground mt-4 flex items-center gap-1">
                <Check className="w-3 h-3" /> Secure inquiry process. No payment required today.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
