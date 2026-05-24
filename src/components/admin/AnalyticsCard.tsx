import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export function AnalyticsCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-lg border border-white/10 bg-white/[0.055] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#d7b46a]/80">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#d7b46a]/10 text-[#f4d58d]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm text-[#f6ead0]/55">{detail}</p>
    </motion.div>
  );
}
