import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  title: string;
  image: string;
  slug: string;
  delay?: number;
}

export function CategoryCard({ title, image, slug, delay = 0 }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <Link href={`/catalog?category=${slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-10" />
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
          <h3 className="text-2xl font-display font-bold text-white mb-2">{title}</h3>
          <div className="flex items-center gap-2 text-white/90 text-sm font-medium opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            Shop Collection <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
