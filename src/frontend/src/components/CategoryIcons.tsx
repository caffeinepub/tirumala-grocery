import { Button } from "@/components/ui/button";
import { Apple, Beef, Flame, Milk, ShoppingBag, Wheat } from "lucide-react";
import { motion } from "motion/react";
import { useGetAllCategories } from "../hooks/useQueries";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4"];

function getCategoryMeta(label: string) {
  const lower = label.toLowerCase();
  if (lower === "fruits")
    return { icon: Apple, color: "bg-orange-100 text-orange-600" };
  if (lower === "vegetables")
    return { icon: Beef, color: "bg-green-100 text-green-700" };
  if (lower === "dairy")
    return { icon: Milk, color: "bg-blue-100 text-blue-600" };
  if (lower === "grains")
    return { icon: Wheat, color: "bg-amber-100 text-amber-700" };
  if (lower === "spices")
    return { icon: Flame, color: "bg-red-100 text-red-600" };
  return { icon: ShoppingBag, color: "bg-gray-100 text-gray-600" };
}

interface CategoryIconsProps {
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

export function CategoryIcons({
  selectedCategory,
  onSelectCategory,
}: CategoryIconsProps) {
  const { data: categories, isLoading } = useGetAllCategories();

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
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex justify-start md:justify-center gap-6 md:gap-10 mb-3 min-w-max md:min-w-0 px-1">
            {isLoading
              ? SKELETON_KEYS.map((key) => (
                  <div key={key} className="flex flex-col items-center gap-1.5">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-muted animate-pulse" />
                    <div className="w-10 h-2 rounded bg-muted animate-pulse" />
                  </div>
                ))
              : (categories ?? []).map((label, i) => {
                  const { icon: Icon, color } = getCategoryMeta(label);
                  const isActive = selectedCategory === label;
                  return (
                    <motion.button
                      key={label}
                      data-ocid={`category.item.button.${i + 1}`}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08, duration: 0.4 }}
                      onClick={() => handleClick(label)}
                      className="flex flex-col items-center gap-1.5 group focus:outline-none"
                    >
                      <div
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                          isActive
                            ? `ring-2 ring-primary ring-offset-2 scale-110 ${color}`
                            : `${color} group-hover:scale-110 group-hover:shadow-md`
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
                        {label}
                      </span>
                    </motion.button>
                  );
                })}
          </div>
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
