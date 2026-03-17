import { Button } from "@/components/ui/button";
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
          className="w-full sm:max-w-md flex flex-col p-0 overflow-hidden bg-amber-50"
          side="right"
        >
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-amber-200 flex-shrink-0 bg-amber-50">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold flex items-center gap-2 text-black">
                <ShoppingBag className="h-5 w-5 text-amber-600" />
                Your Cart
                {items.length > 0 && (
                  <span className="text-sm font-normal text-amber-700">
                    ({items.length})
                  </span>
                )}
              </SheetTitle>
              <Button
                data-ocid="cart.close_button"
                variant="ghost"
                size="icon"
                className="text-black hover:text-amber-700 hover:bg-amber-100"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {isLoading ? (
            <div
              data-ocid="cart.loading_state"
              className="px-6 py-4 space-y-4 bg-amber-50"
            >
              {skeletonKeys.map((k) => (
                <div key={k} className="flex gap-3">
                  <Skeleton className="w-16 h-16 rounded-lg bg-amber-100" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-amber-100" />
                    <Skeleton className="h-4 w-1/3 bg-amber-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div
              data-ocid="cart.empty_state"
              className="flex-1 flex flex-col items-center justify-center px-6 text-center bg-amber-50"
            >
              <ShoppingBag className="h-12 w-12 text-amber-300 mb-4" />
              <h3 className="font-bold text-lg text-black mb-1">
                Your cart is empty
              </h3>
              <p className="text-sm text-amber-700">
                Add some items to get started.
              </p>
              <Button
                data-ocid="cart.primary_button"
                className="mt-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                onClick={onClose}
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <>
              <div
                className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain bg-amber-50"
                style={{ WebkitOverflowScrolling: "touch" }}
              >
                <ul className="space-y-4">
                  {items.map((item, i) => (
                    <li
                      key={item.id.toString()}
                      data-ocid={`cart.item.${i + 1}`}
                      className="flex gap-3 items-start bg-white border border-amber-100 rounded-xl p-3 shadow-sm"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-lg text-amber-400">
                            {item.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-black truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          {item.category}
                        </p>
                        <p className="font-bold text-sm text-black mt-1">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <Button
                        data-ocid={`cart.delete_button.${i + 1}`}
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0 text-amber-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => handleRemove(item.id, item.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-amber-200 px-6 py-4 flex-shrink-0 bg-amber-50">
                <Separator className="mb-4 bg-amber-200" />
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="font-bold text-lg text-black">
                    ₹{(subtotal / 100).toFixed(2)}
                  </span>
                </div>

                <SheetFooter className="flex-col gap-2">
                  <Button
                    data-ocid="cart.submit_button"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                    size="lg"
                    onClick={() => setCheckoutOpen(true)}
                  >
                    Checkout
                  </Button>
                  <Button
                    data-ocid="cart.delete_button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-amber-700 hover:text-red-600 hover:bg-red-50"
                    onClick={handleClear}
                    disabled={clearCart.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
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
