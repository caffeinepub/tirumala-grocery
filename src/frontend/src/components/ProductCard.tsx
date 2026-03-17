import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import type { Product } from "../backend.d";

function formatPrice(price: bigint) {
  return `\u20B9${Number(price).toLocaleString("en-IN")}`;
}

interface ProductCardProps {
  product: Product;
  index: number;
  onAddToCart: (id: bigint) => void;
  isAdding: boolean;
}

export function ProductCard({
  product,
  index,
  onAddToCart,
  isAdding,
}: ProductCardProps) {
  const hasImage = product.imageUrl && product.imageUrl.length > 0;
  const outOfStock = Number(product.stock) === 0;
  const lowStock = Number(product.stock) > 0 && Number(product.stock) <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: (index % 10) * 0.04 }}
      data-ocid={`products.item.${index + 1}`}
      className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col"
    >
      {/* Square image/placeholder */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {hasImage ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-accent/40 to-secondary/40">
            <span className="font-display text-xl font-bold text-foreground/25">
              {product.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Badge className="bg-destructive text-destructive-foreground text-[9px] font-semibold px-1.5 py-0.5">
              Out of Stock
            </Badge>
          </div>
        )}

        {/* Low stock badge */}
        {lowStock && (
          <div className="absolute bottom-1 left-1">
            <span className="text-[8px] font-semibold bg-amber-100 text-amber-700 px-1 py-0.5 rounded-full">
              {product.stock.toString()} left
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-1.5 flex flex-col flex-1 gap-1">
        <p className="text-[11px] font-semibold text-foreground leading-tight line-clamp-2 min-h-[1.75rem]">
          {product.name}
        </p>

        <div className="flex items-center justify-between gap-1 mt-auto">
          <span className="text-xs font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          <Button
            data-ocid={`products.item.${index + 1}.button`}
            size="sm"
            onClick={() => onAddToCart(product.id)}
            disabled={isAdding || outOfStock}
            className="h-6 px-1.5 text-[10px] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-0.5"
          >
            <ShoppingCart className="h-3 w-3" />
            {outOfStock ? "N/A" : "Add"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
