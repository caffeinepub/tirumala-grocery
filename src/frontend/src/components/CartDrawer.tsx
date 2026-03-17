import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import {
  useClearCart,
  useGetCart,
  useRemoveFromCart,
} from "../hooks/useQueries";
import { CustomerDetailsDialog } from "./CustomerDetailsDialog";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

function formatPrice(paise: bigint) {
  return `₹${(Number(paise) / 100).toFixed(2)}`;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { data: cartItems, isLoading } = useGetCart();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const items: Product[] = cartItems ?? [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.price), 0);

  function handleRemove(id: bigint, name: string) {
    removeFromCart.mutate(id, {
      onSuccess: () => toast.success(`${name} removed from cart`),
    });
  }

  function handleClear() {
    clearCart.mutate(undefined, {
      onSuccess: () => toast.success("Cart cleared"),
    });
  }

  function handleOrderPlaced() {
    setCheckoutOpen(false);
    onClose();
  }

  const skeletonKeys = ["sk-1", "sk-2", "sk-3"];

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          data-ocid="cart.sheet"
          className="w-full sm:max-w-md flex flex-col p-0"
          side="right"
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-display text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="h-2.5 w-2.5" />
                Your Cart
                {items.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({items.length})
                  </span>
                )}
              </SheetTitle>
              <Button
                data-ocid="cart.close_button"
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </SheetHeader>

          {isLoading ? (
            <div data-ocid="cart.loading_state" className="px-6 py-4 space-y-4">
              {skeletonKeys.map((k) => (
                <div key={k} className="flex gap-3">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div
              data-ocid="cart.empty_state"
              className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            >
              <ShoppingBag className="h-6 w-6 text-muted-foreground/30 mb-4" />
              <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                Your cart is empty
              </h3>
              <p className="text-sm text-muted-foreground">
                Add some items to get started.
              </p>
              <Button
                data-ocid="cart.primary_button"
                className="mt-6 bg-primary text-primary-foreground"
                onClick={onClose}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-6 py-4">
                <ul className="space-y-4">
                  {items.map((item, i) => (
                    <li
                      key={item.id.toString()}
                      data-ocid={`cart.item.${i + 1}`}
                      className="flex gap-3 items-start"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-accent/30 to-secondary/30 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-display font-bold text-lg text-foreground/30">
                            {item.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {item.category}
                        </p>
                        <p className="font-display font-bold text-sm text-foreground mt-1">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <Button
                        data-ocid={`cart.delete_button.${i + 1}`}
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 flex-shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemove(item.id, item.name)}
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>

              <div className="border-t border-border px-6 py-4">
                <Separator className="mb-4" />
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="font-display font-bold text-lg">
                    ₹{(subtotal / 100).toFixed(2)}
                  </span>
                </div>

                <SheetFooter className="flex-col gap-2">
                  <Button
                    data-ocid="cart.submit_button"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                    size="lg"
                    onClick={() => setCheckoutOpen(true)}
                  >
                    Checkout
                  </Button>
                  <Button
                    data-ocid="cart.delete_button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-destructive"
                    onClick={handleClear}
                    disabled={clearCart.isPending}
                  >
                    <Trash2 className="h-2.5 w-2.5 mr-1.5" />
                    Clear Cart
                  </Button>
                </SheetFooter>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CustomerDetailsDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderPlaced={handleOrderPlaced}
        itemCount={items.length}
        total={subtotal}
      />
    </>
  );
}
