import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { AboutSection } from "./components/AboutSection";
import { AdminPage } from "./components/AdminPage";
import { CartDrawer } from "./components/CartDrawer";
import { CategoryIcons } from "./components/CategoryIcons";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Navbar } from "./components/Navbar";
import { OffersBanner } from "./components/OffersBanner";
import { ProductGrid } from "./components/ProductGrid";
import { useGetCart } from "./hooks/useQueries";

function useRoute() {
  const [path, setPath] = useState(() => window.location.pathname);
  function navigate(to: string) {
    window.history.pushState({}, "", to);
    setPath(to);
  }
  return { path, navigate };
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const { data: cartItems } = useGetCart();
  const cartCount = cartItems?.length ?? 0;
  const { path, navigate } = useRoute();
  const [isAdminDevice, setIsAdminDevice] = useState(
    () => localStorage.getItem("tirumala_admin_device") === "true",
  );
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleAdminActivate() {
    localStorage.setItem("tirumala_admin_device", "true");
    setIsAdminDevice(true);
  }

  function handleDeactivateAdmin() {
    localStorage.removeItem("tirumala_admin_device");
    setIsAdminDevice(false);
    navigate("/");
  }

  if (path === "/admin") {
    return (
      <>
        <Toaster richColors position="top-right" />
        <AdminPage
          onBack={() => navigate("/")}
          onDeactivateAdmin={handleDeactivateAdmin}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster richColors position="top-right" />
      <Navbar
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onNavClick={scrollTo}
        onAdminClick={() => navigate("/admin")}
        isAdminDevice={isAdminDevice}
        onAdminActivate={handleAdminActivate}
      />
      <CategoryIcons
        selectedCategory={filterCategory}
        onSelectCategory={setFilterCategory}
      />
      <OffersBanner />
      <main className="flex-1">
        <Hero onShopNow={() => scrollTo("products")} />
        <ProductGrid
          filterCategory={filterCategory}
          onClearFilter={() => setFilterCategory(null)}
        />
        <AboutSection />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
