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

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
        <button
          type="button"
          data-ocid="nav.home.link"
          onClick={handleLogoClick}
          className="font-display text-xl font-semibold text-foreground hover:text-primary transition-colors"
        >
          Tirumala Grocery
        </button>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <button
              type="button"
              key={link.id}
              data-ocid={`nav.${link.id}.link`}
              onClick={() => onNavClick(link.id)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAdminDevice && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-ocid="nav.admin.link"
              onClick={onAdminClick}
              className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Settings className="h-2.5 w-2.5" />
              Admin
            </Button>
          )}

          <Button
            type="button"
            data-ocid="nav.cart.button"
            variant="ghost"
            size="icon"
            onClick={onCartOpen}
            className="relative"
            aria-label={`Cart, ${cartCount} items`}
          >
            <ShoppingCart className="h-2.5 w-2.5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-3 w-3 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground">
                {cartCount}
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-2.5 w-2.5" />
            ) : (
              <Menu className="h-2.5 w-2.5" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border bg-background"
          >
            <nav className="flex flex-col p-4 gap-1">
              {links.map((link) => (
                <button
                  type="button"
                  key={link.id}
                  data-ocid={`nav.mobile.${link.id}.link`}
                  onClick={() => {
                    onNavClick(link.id);
                    setMobileOpen(false);
                  }}
                  className="text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
                  className="text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                >
                  <Settings className="h-2.5 w-2.5" />
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
