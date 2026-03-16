import { Skeleton } from "@/components/ui/skeleton";
import { Settings } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useAddToCart, useGetAllProducts } from "../hooks/useQueries";
import { ProductCard } from "./ProductCard";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"];

export function ProductGrid() {
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

  return (
    <section id="products" className="py-20 container mx-auto px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 block">
          Our Collection
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Explore the Shop
        </h2>
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
        <div
          data-ocid="products.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {SKELETON_KEYS.map((k) => (
            <div
              key={k}
              className="rounded-xl overflow-hidden border border-border"
            >
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between pt-1">
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <div
          data-ocid="products.empty_state"
          className="text-center py-20 border border-dashed border-border rounded-2xl text-muted-foreground"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <Settings className="h-5 w-5" />
          </div>
          <p className="text-base font-medium mb-1">No products yet</p>
          <p className="text-sm">
            Visit the{" "}
            <span className="font-medium text-foreground">Admin Panel</span> to
            add products to your store.
          </p>
        </div>
      ) : (
        <div
          data-ocid="products.list"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {(products as Product[]).map((product, i) => (
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
