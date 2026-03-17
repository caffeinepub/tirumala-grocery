import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { motion } from "motion/react";
import type { Product } from "../backend.d";

function formatPrice(price: bigint) {
  return `\u20B9${Number(price).toLocaleString("en-IN")}`;
}

// Product image map keyed by keyword fragments in product names
const PRODUCT_IMAGE_MAP: { keywords: string[]; src: string }[] = [
  {
    keywords: ["amul taaza", "toned milk 500", "mother dairy toned"],
    src: "/assets/generated/milk_pack_500ml.dim_300x300.jpg",
  },
  {
    keywords: [
      "taaza",
      "toned milk 1l",
      "toned milk 1 l",
      "full cream milk",
      "mother dairy full cream",
    ],
    src: "/assets/generated/milk_pack_1l.dim_300x300.jpg",
  },
  {
    keywords: ["butter"],
    src: "/assets/generated/butter_pack.dim_300x300.jpg",
  },
  {
    keywords: ["dahi", "curd", "mishti doi"],
    src: "/assets/generated/dahi_curd.dim_300x300.jpg",
  },
  {
    keywords: ["paneer"],
    src: "/assets/generated/fresh_paneer.dim_300x300.jpg",
  },
  { keywords: ["ghee"], src: "/assets/generated/pure_ghee.dim_300x300.jpg" },
  {
    keywords: ["cheese slices"],
    src: "/assets/generated/cheese_slices.dim_300x300.jpg",
  },
  {
    keywords: ["cheese block", "processed cheese"],
    src: "/assets/generated/cheese_slices.dim_300x300.jpg",
  },
  { keywords: ["cream"], src: "/assets/generated/fresh_cream.dim_300x300.jpg" },
  {
    keywords: ["buttermilk", "chaas", "spiced but"],
    src: "/assets/generated/buttermilk_chaas.dim_300x300.jpg",
  },
  {
    keywords: ["mango lassi"],
    src: "/assets/generated/mango_lassi.dim_300x300.jpg",
  },
  {
    keywords: ["kool cafe", "coffee"],
    src: "/assets/generated/kool_cafe.dim_300x300.jpg",
  },
  {
    keywords: ["kool chocolate", "chocolate milk"],
    src: "/assets/generated/chocolate_milk.dim_300x300.jpg",
  },
  {
    keywords: ["condensed", "milkmaid"],
    src: "/assets/generated/condensed_milk.dim_300x300.jpg",
  },
  {
    keywords: ["shrikhand"],
    src: "/assets/generated/shrikhand.dim_300x300.jpg",
  },
  {
    keywords: ["finger millet", "ragulu", "ragi"],
    src: "/assets/generated/finger_millet.dim_300x300.jpg",
  },
  {
    keywords: ["kidney bean", "cikkadu"],
    src: "/assets/generated/kidney_beans.dim_300x300.jpg",
  },
  {
    keywords: ["aniseed", "sopu", "saunf"],
    src: "/assets/generated/aniseed.dim_300x300.jpg",
  },
  {
    keywords: ["asafoetida", "inguva", "hing"],
    src: "/assets/generated/asafoetida_hing.dim_300x300.jpg",
  },
  {
    keywords: ["bay leaf", "masala aku", "tejpatta"],
    src: "/assets/generated/bay_leaf.dim_300x300.jpg",
  },
  {
    keywords: ["black pepper", "miriyalu"],
    src: "/assets/generated/black_pepper.dim_300x300.jpg",
  },
  {
    keywords: ["cardamom", "elakulu", "elaichi"],
    src: "/assets/generated/cardamom.dim_300x300.jpg",
  },
  {
    keywords: ["cinnamon", "dalchini", "dalchina"],
    src: "/assets/generated/cinnamon.dim_300x300.jpg",
  },
  {
    keywords: ["clove", "lavangam", "lavang"],
    src: "/assets/generated/cloves.dim_300x300.jpg",
  },
];

function getProductImage(name: string, imageUrl: string): string | null {
  if (imageUrl && imageUrl.trim() !== "") return imageUrl;
  const lower = name.toLowerCase();
  for (const entry of PRODUCT_IMAGE_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.src;
    }
  }
  return null;
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
  const resolvedImage = getProductImage(product.name, product.imageUrl);
  const outOfStock = Number(product.stock) === 0;
  const lowStock = Number(product.stock) > 0 && Number(product.stock) <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: (index % 10) * 0.04 }}
      data-ocid={`products.item.${index + 1}`}
      className="group rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col bg-amber-50 border border-amber-100"
    >
      {/* Larger 4:3 image area */}
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        {resolvedImage ? (
          <img
            src={resolvedImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 text-black">
            <span className="text-3xl font-extrabold opacity-70">
              {product.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Badge className="bg-destructive text-destructive-foreground text-[9px] font-semibold px-1.5 py-0.5">
              Out of Stock
            </Badge>
          </div>
        )}

        {lowStock && (
          <div className="absolute bottom-1 left-1">
            <span className="text-[8px] font-semibold bg-amber-100 text-black px-1 py-0.5 rounded-full">
              {product.stock.toString()} left
            </span>
          </div>
        )}
      </div>

      {/* Content below photo */}
      <div className="p-2 flex flex-col flex-1 gap-1">
        {/* Product name */}
        <p className="text-[10px] font-semibold text-black leading-tight truncate">
          {product.name}
        </p>

        {/* Quantity label */}
        {(product.quantityLabel || product.unit) && (
          <span className="text-[8px] text-gray-600 font-medium">
            {product.quantityLabel || product.unit}
          </span>
        )}

        {/* Price — bold black */}
        <span className="text-base font-extrabold text-black leading-none mt-0.5">
          {formatPrice(product.price)}
        </span>

        {/* Add button */}
        <Button
          data-ocid={`products.item.${index + 1}.button`}
          size="sm"
          onClick={() => onAddToCart(product.id)}
          disabled={isAdding || outOfStock}
          className="mt-1 w-full h-7 text-[10px] font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 border-0 bg-amber-600 hover:bg-amber-700 text-white"
        >
          <ShoppingCart className="h-3 w-3" />
          {outOfStock ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </motion.div>
  );
}
