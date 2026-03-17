import { Button } from "@/components/ui/button";
import { Apple, Beef, Milk, ShoppingBag, Wheat } from "lucide-react";
import { motion } from "motion/react";

const CATEGORIES = [
  {
    label: "Fruits",
    icon: Apple,
    color: "bg-orange-100 text-orange-600",
    ocid: "category.fruits.button",
  },
  {
    label: "Vegetables",
    icon: Beef,
    color: "bg-green-100 text-green-700",
    ocid: "category.vegetables.button",
  },
  {
    label: "Dairy",
    icon: Milk,
    color: "bg-blue-100 text-blue-600",
    ocid: "category.dairy.button",
  },
  {
    label: "Grains",
    icon: Wheat,
    color: "bg-amber-100 text-amber-700",
    ocid: "category.grains.button",
  },
];

interface CategoryIconsProps {
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

export function CategoryIcons({
  selectedCategory,
  onSelectCategory,
}: CategoryIconsProps) {
  function handleClick(label: string) {
    const next = selectedCategory === label ? null : label;
    onSelectCategory(next);
    setTimeout(() => {
      const el = document.getElementById("products");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <section className="pt-3 pb-4 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* 4 category icons in a single line */}
        <div className="flex justify-center gap-6 md:gap-10 mb-3">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.label;
            return (
              <motion.button
                key={cat.label}
                data-ocid={cat.ocid}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                onClick={() => handleClick(cat.label)}
                className="flex flex-col items-center gap-1.5 group focus:outline-none"
              >
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                    isActive
                      ? `ring-2 ring-primary ring-offset-2 scale-110 ${cat.color}`
                      : `${cat.color} group-hover:scale-110 group-hover:shadow-md`
                  }`}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span
                  className={`text-[10px] font-semibold tracking-wide transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* View Products button */}
        <div className="flex justify-center">
          <Button
            data-ocid="category.view_products.button"
            variant="default"
            size="sm"
            className="gap-1.5 font-semibold px-6"
            onClick={() => {
              const el = document.getElementById("products");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            View Products
          </Button>
        </div>
      </div>
    </section>
  );
}
