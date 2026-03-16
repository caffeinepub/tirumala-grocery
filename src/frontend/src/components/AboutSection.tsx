import { Heart, Leaf, Package } from "lucide-react";
import { motion } from "motion/react";

const VALUES = [
  {
    icon: Heart,
    title: "Made with Love",
    description:
      "Every product is chosen with care, from makers who pour their hearts into their craft.",
  },
  {
    icon: Package,
    title: "Quality First",
    description:
      "We only carry items we'd be proud to give as gifts. No compromises on materials or craft.",
  },
  {
    icon: Leaf,
    title: "Sustainably Sourced",
    description:
      "We partner with independent artisans and small-batch producers who respect the planet.",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="bg-muted/60 py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text block */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 block">
              Our Story
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
              A Store Built on
              <br />
              <span className="italic font-light">Good Taste</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              My Store was born from a simple belief: the objects we surround
              ourselves with should bring joy. We started as a small market
              stall, hand-selecting items from local craftspeople, and grew into
              a destination for anyone who values quality over quantity.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, we carry a curated collection of ceramics, textiles, home
              goods, and accessories — all made by people who love what they do.
              When you shop here, you support real makers doing meaningful work.
            </p>
          </motion.div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 * i }}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">
                    {v.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {v.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
