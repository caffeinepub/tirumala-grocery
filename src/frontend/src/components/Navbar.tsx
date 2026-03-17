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
  { label: "Grains", emoji: "🌾", color: "bg-amber-500" },
  { label: "Dairy", emoji: "🥛", color: "bg-sky-400" },
  { label: "Spices", emoji: "🌶️", color: "bg-orange-500" },
  { label: "Fruits", emoji: "🍎", color: "bg-pink-500" },
  { label: "Vegetables", emoji: "🥦", color: "bg-green-500" },
  { label: "Pulses", emoji: "🫘", color: "bg-yellow-600" },
  { label: "Oils", emoji: "🫙", color: "bg-lime-500" },
  { label: "Snacks", emoji: "🍿", color: "bg-purple-500" },
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
          className="font-bold text-base text-amber-800 hover:text-amber-600 transition-colors tracking-tight"
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
              className="text-xs font-medium text-stone-500 hover:text-amber-700 transition-colors"
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
              className="hidden md:flex items-center gap-1 text-xs text-stone-500 hover:text-amber-700 h-7 px-2"
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
            <ShoppingCart className="h-4 w-4 text-amber-700" />
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

      {/* Colorful category chips row */}
      <div className="border-t border-stone-100 bg-gradient-to-r from-amber-50 via-white to-green-50">
        <div
          className="flex items-center gap-2 px-3 md:px-5 py-1.5 overflow-x-auto"
          style={
            {
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            } as React.CSSProperties
          }
        >
          {CATEGORY_CHIPS.map((chip) => (
            <button
              key={chip.label}
              type="button"
              data-ocid={`nav.category.${chip.label.toLowerCase()}.button`}
              onClick={handleChipClick}
              className={`flex-shrink-0 flex items-center gap-1 ${chip.color} text-white text-xs font-semibold px-3 py-0.5 rounded-full hover:opacity-85 active:scale-95 transition-all shadow-sm`}
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
                  className="text-left px-3 py-1.5 rounded-md text-sm font-medium text-stone-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
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
                  className="text-left px-3 py-1.5 rounded-md text-sm font-medium text-stone-500 hover:text-amber-700 hover:bg-amber-50 transition-colors flex items-center gap-1.5"
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
