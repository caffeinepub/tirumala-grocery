import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

interface HeroProps {
  onShopNow: () => void;
}

export function Hero({ onShopNow }: HeroProps) {
  return (
    <section
      id="home"
      className="relative overflow-hidden grain-overlay min-h-[560px] md:min-h-[680px] flex items-center"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('/assets/generated/hero-store.dim_1400x700.jpg')",
        }}
      />
      {/* Warm overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-xl"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block text-xs font-semibold uppercase tracking-widest text-primary-foreground/70 mb-4"
          >
            Handpicked for you
          </motion.span>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground leading-tight mb-5">
            Discover Things
            <br />
            You'll <span className="italic font-light">Love</span>
          </h1>

          <p className="text-primary-foreground/80 text-lg mb-8 max-w-sm leading-relaxed">
            Carefully curated products, thoughtfully sourced. Find something
            special for every moment.
          </p>

          <Button
            data-ocid="hero.primary_button"
            size="lg"
            onClick={onShopNow}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-6 text-base shadow-warm transition-transform hover:scale-105"
          >
            Shop Now
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
