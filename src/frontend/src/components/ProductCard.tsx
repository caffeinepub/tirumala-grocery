import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import type { Product } from "../backend.d";

interface ProductCardProps {
  product: Product;
  index: number;
  onAddToCart: (id: bigint) => void;
  isAdding: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  ceramics: "bg-amber-100 text-amber-800",
  textiles: "bg-green-100 text-green-800",
  candles: "bg-orange-100 text-orange-800",
  jewelry: "bg-pink-100 text-pink-800",
  kitchen: "bg-yellow-100 text-yellow-800",
  art: "bg-purple-100 text-purple-800",
  default: "bg-muted text-muted-foreground",
};

function getCategoryColor(cat: string) {
  const key = cat.toLowerCase();
  return CATEGORY_COLORS[key] ?? CATEGORY_COLORS.default;
}

function formatPrice(paise: bigint) {
  return `₹${(Number(paise) / 100).toFixed(2)}`;
}

export function ProductCard({
  product,
  index,
  onAddToCart,
  isAdding,
}: ProductCardProps) {
  const hasImage = product.imageUrl && product.imageUrl.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.07 }}
      data-ocid={`products.item.${index + 1}`}
      className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-warm transition-shadow duration-300 flex flex-col"
    >
      {/* Image / Placeholder */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {hasImage ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-accent/30 to-secondary/30">
            <span className="font-display text-3xl font-bold text-foreground/20 text-center">
              {product.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="mt-2 text-xs font-medium text-muted-foreground text-center leading-tight">
              {product.name}
            </span>
          </div>
        )}

        {/* Category badge overlay */}
        <div className="absolute top-3 left-3">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${getCategoryColor(product.category)}`}
          >
            {product.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-base text-foreground mb-1 leading-snug">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-lg text-foreground">
            {formatPrice(product.price)}
          </span>
          <Button
            data-ocid={`products.item.${index + 1}.button`}
            size="sm"
            onClick={() => onAddToCart(product.id)}
            disabled={isAdding}
            className="bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105"
          >
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
