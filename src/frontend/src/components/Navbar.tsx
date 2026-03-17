import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Menu, Settings, ShoppingCart, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

interface NavbarProps {
  cartCount: number;
  onCartOpen: () => void;
  onNavClick: (section: string) => void;
  onAdminClick: () => void;
  isAdminDevice?: boolean;
  onAdminActivate?: () => void;
}

const CATEGORY_CHIPS = [
  { label: "Grains", emoji: "🌾" },
  { label: "Dairy", emoji: "🥛" },
  { label: "Spices", emoji: "🌶️" },
  { label: "Fruits", emoji: "🍎" },
  { label: "Vegetables", emoji: "🥦" },
  { label: "Pulses", emoji: "🫘" },
  { label: "Oils", emoji: "🫙" },
  { label: "Snacks", emoji: "🍿" },
];

export function Navbar({
  cartCount,
  onCartOpen,
  onNavClick,
  onAdminClick,
  isAdminDevice = false,
  onAdminActivate,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const links = [
    { label: "Home", id: "home" },
    { label: "Products", id: "products" },
    { label: "About", id: "about" },
  ];

  function handleLogoClick() {
    onNavClick("home");
    clickCountRef.current += 1;
    if (clickCountRef.current === 1) {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 3000);
    }
    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      setPinDialogOpen(true);
      setPin("");
      setPinError("");
    }
  }

  function handlePinSubmit() {
    const savedPin = localStorage.getItem("tg_admin_pin") || "9999";
    if (pin === savedPin) {
      setPinDialogOpen(false);
      setPin("");
      setPinError("");
      onAdminActivate?.();
    } else {
      setPinError("Incorrect PIN. Please try again.");
    }
  }

  function handleChipClick() {
    onNavClick("products");
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
      {/* Main top row */}
      <div className="container mx-auto flex items-center justify-between h-11 px-3 md:px-5">
        <button
          type="button"
          data-ocid="nav.home.link"
          onClick={handleLogoClick}
          className="font-bold text-base text-black hover:text-stone-700 transition-colors tracking-tight"
        >
          🛒 Tirumala Grocery
        </button>

        <nav className="hidden md:flex items-center gap-4">
          {links.map((link) => (
            <button
              type="button"
              key={link.id}
              data-ocid={`nav.${link.id}.link`}
              onClick={() => onNavClick(link.id)}
              className="text-xs font-medium text-black hover:text-stone-600 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {isAdminDevice && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-ocid="nav.admin.link"
              onClick={onAdminClick}
              className="hidden md:flex items-center gap-1 text-xs text-black hover:text-stone-600 h-7 px-2"
            >
              <Settings className="h-3 w-3" />
              Admin
            </Button>
          )}

          <Button
            type="button"
            data-ocid="nav.cart.button"
            variant="ghost"
            size="icon"
            onClick={onCartOpen}
            className="relative h-8 w-8"
            aria-label={`Cart, ${cartCount} items`}
          >
            <ShoppingCart className="h-4 w-4 text-black" />
            {cartCount > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-red-500 text-white border-0">
                {cartCount}
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-3.5 w-3.5" />
            ) : (
              <Menu className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Warm artisan category chips row */}
      <div className="border-t border-stone-100 bg-gradient-to-r from-amber-50 via-white to-green-50">
        <div className="flex items-center gap-2 px-3 md:px-5 py-1.5 overflow-x-auto scrollbar-hide">
          {CATEGORY_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              data-ocid={`nav.category.${chip.label.toLowerCase()}.button`}
              onClick={handleChipClick}
              className="flex-shrink-0 flex items-center gap-1 bg-amber-100 text-black border border-stone-300 text-xs font-semibold px-3 py-0.5 rounded-full hover:bg-amber-200 active:scale-95 transition-all"
            >
              <span>{chip.emoji}</span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-stone-100 bg-white"
          >
            <nav className="flex flex-col p-3 gap-0.5">
              {links.map((link) => (
                <button
                  type="button"
                  key={link.id}
                  data-ocid={`nav.mobile.${link.id}.link`}
                  onClick={() => {
                    onNavClick(link.id);
                    setMobileOpen(false);
                  }}
                  className="text-left px-3 py-1.5 rounded-md text-sm font-medium text-black hover:text-stone-700 hover:bg-amber-50 transition-colors"
                >
                  {link.label}
                </button>
              ))}
              {isAdminDevice && (
                <button
                  type="button"
                  data-ocid="nav.mobile.admin.link"
                  onClick={() => {
                    onAdminClick();
                    setMobileOpen(false);
                  }}
                  className="text-left px-3 py-1.5 rounded-md text-sm font-medium text-black hover:text-stone-700 hover:bg-amber-50 transition-colors flex items-center gap-1.5"
                >
                  <Settings className="h-3 w-3" />
                  Admin
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog
        open={pinDialogOpen}
        onOpenChange={(v) => {
          if (!v) {
            setPinDialogOpen(false);
            setPin("");
            setPinError("");
          }
        }}
      >
        <DialogContent
          data-ocid="nav.admin_activate.dialog"
          className="max-w-xs"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-base">
              Admin Access
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="admin-pin">Enter 4-digit PIN</Label>
              <Input
                id="admin-pin"
                data-ocid="admin_activate.pin.input"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 4));
                  setPinError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
                placeholder="••••"
                className="tracking-widest text-center text-lg"
              />
            </div>
            {pinError && (
              <p
                data-ocid="admin_activate.error_state"
                className="text-destructive text-xs"
              >
                {pinError}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="admin_activate.cancel_button"
              onClick={() => {
                setPinDialogOpen(false);
                setPin("");
                setPinError("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              data-ocid="admin_activate.submit_button"
              onClick={handlePinSubmit}
              className="bg-primary text-primary-foreground"
            >
              Unlock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
