import { Product } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
        
        <CardFooter className="p-5 pt-0 flex items-center justify-between mt-auto">
          <span className="font-display font-bold text-lg text-primary">
            ₹{product.price}
          </span>
          <Button asChild variant="outline" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Link href={`/product/${product.id}`}>View Details</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
