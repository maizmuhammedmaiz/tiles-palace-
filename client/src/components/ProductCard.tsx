import { Product } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group h-full"
    >
      <Card className="h-full overflow-hidden border-border/50 hover:border-primary/50 transition-colors duration-300 flex flex-col bg-card shadow-sm hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800";
            }}
          />
          {product.featured && (
            <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-md shadow-sm">
              Featured
            </div>
          )}
        </div>
        
        <CardContent className="p-5 flex-grow">
          <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            {product.category}
          </div>
          <h3 className="font-display font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        </CardContent>
        
        <CardFooter className="p-5 pt-0 flex flex-col gap-3 mt-auto">
          <div className="flex items-center justify-between w-full">
            <span className="font-display font-bold text-lg text-primary">
              ₹{parseFloat(product.price).toLocaleString("en-IN")}
            </span>
            <Button asChild variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Link href={`/product/${product.id}`}>View Details</Link>
            </Button>
          </div>
          <div className="flex gap-2 w-full">
            <Button
              variant={added ? "default" : "outline"}
              size="sm"
              className={`flex-1 gap-1.5 transition-all ${added ? "bg-green-600 hover:bg-green-700 border-green-600 text-white" : ""}`}
              onClick={handleAddToCart}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
              {added ? "Added!" : "Add to Cart"}
            </Button>
            <Button className="flex-1 h-9 font-semibold shadow-sm" asChild>
              <Link href={`/product/${product.id}`}>Order Now</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
