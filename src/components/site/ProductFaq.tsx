import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";

export function ProductFaq({ faqs }: { faqs?: Array<{ question: string; answer: string }> }) {
  const [open, setOpen] = useState<number | null>(0);
  if (!faqs?.length) return null;

  return (
    <section className="mt-24 md:mt-32 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10 md:mb-14"
      >
        <span className="text-[11px] tracking-[0.32em] uppercase text-rose-gold">Good to know</span>
        <h2 className="font-display text-3xl md:text-5xl mt-3 leading-tight">Your questions, answered</h2>
      </motion.div>

      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.04 }}
              className="rounded-2xl bg-card border border-border/70 shadow-soft hover:border-rose-gold/40 transition-colors overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-6 text-left px-5 md:px-7 py-5 md:py-6"
                aria-expanded={isOpen}
              >
                <span className="font-display text-base md:text-lg leading-snug">{faq.question}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={`h-9 w-9 shrink-0 rounded-full grid place-items-center border transition-colors ${
                    isOpen ? "bg-rose-gold text-primary-foreground border-rose-gold" : "border-border text-foreground/70"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 md:px-7 pb-6 md:pb-7 -mt-1 text-sm md:text-[15px] text-foreground/70 leading-[1.8] max-w-[55ch]">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
