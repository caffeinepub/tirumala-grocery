import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PackageSearch, X } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useAddToCart, useGetAllProducts } from "../hooks/useQueries";
import { ProductCard } from "./ProductCard";

const SKELETON_KEYS = [
  "sk-1",
  "sk-2",
  "sk-3",
  "sk-4",
  "sk-5",
  "sk-6",
  "sk-7",
  "sk-8",
  "sk-9",
  "sk-10",
];

interface ProductGridProps {
  filterCategory?: string | null;
  onClearFilter?: () => void;
}

export function ProductGrid({
  filterCategory,
  onClearFilter,
}: ProductGridProps) {
  const { data: products, isLoading, isError } = useGetAllProducts();
  const addToCart = useAddToCart();

  function handleAddToCart(id: bigint, name: string) {
    addToCart.mutate(id, {
      onSuccess: () => {
        toast.success(`${name} added to cart!`, {
          description: "View your cart to checkout.",
        });
      },
      onError: () => {
        toast.error("Could not add to cart", {
          description: "Please try again.",
        });
      },
    });
  }

  const filtered = filterCategory
    ? (products as Product[] | undefined)?.filter(
        (p) => p.category === filterCategory,
      )
    : (products as Product[] | undefined);

  const gridClass =
    "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2";

  return (
    <section id="products" className="py-10 container mx-auto px-3 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
      >
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-1 block">
            Our Collection
          </span>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-black">
            {filterCategory ? `${filterCategory} Products` : "Explore the Shop"}
          </h2>
        </div>
        {filterCategory && onClearFilter && (
          <Button
            data-ocid="products.filter.button"
            variant="outline"
            size="sm"
            onClick={onClearFilter}
            className="gap-1.5 self-start sm:self-auto"
          >
            <X className="w-3 h-3" />
            Clear filter: {filterCategory}
          </Button>
        )}
      </motion.div>

      {isError && (
        <div
          data-ocid="products.error_state"
          className="text-center py-12 text-muted-foreground"
        >
          <p>Couldn&apos;t load products. Please try again.</p>
        </div>
      )}

      {isLoading ? (
        <div data-ocid="products.loading_state" className={gridClass}>
          {SKELETON_KEYS.map((k) => (
            <div
              key={k}
              className="rounded-lg overflow-hidden border border-border"
            >
              <Skeleton className="aspect-square w-full" />
              <div className="p-1 space-y-1">
                <Skeleton className="h-2.5 w-3/4" />
                <div className="flex justify-between pt-0.5">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-5 w-10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !filtered || filtered.length === 0 ? (
        <div
          data-ocid="products.empty_state"
          className="text-center py-20 border border-dashed border-border rounded-2xl text-muted-foreground"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <PackageSearch className="h-5 w-5" />
          </div>
          <p className="text-base font-medium mb-1">
            {filterCategory
              ? `No ${filterCategory} products found`
              : "No products to display"}
          </p>
          <p className="text-sm max-w-xs mx-auto">
            {filterCategory ? (
              <span>
                Try{" "}
                <button
                  type="button"
                  onClick={onClearFilter}
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  clearing the filter
                </button>{" "}
                to see all products.
              </span>
            ) : (
              <span>
                Products are loading — if this persists, check the{" "}
                <span className="font-medium text-foreground">Admin panel</span>
                .
              </span>
            )}
          </p>
        </div>
      ) : (
        <div data-ocid="products.list" className={gridClass}>
          {filtered.map((product, i) => (
            <ProductCard
              key={product.id.toString()}
              product={product}
              index={i}
              onAddToCart={(id) => handleAddToCart(id, product.name)}
              isAdding={addToCart.isPending}
            />
          ))}
        </div>
      )}
    </section>
  );
}
