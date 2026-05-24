import { Gem } from "lucide-react";
import { motion } from "framer-motion";

export function Loader({ label = "Preparing your workspace" }: { label?: string }) {
  return (
    <div className="grid min-h-[320px] place-items-center text-center text-white">
      <div>
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.08, 1] }}
          transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" }, scale: { duration: 1.8, repeat: Infinity } }}
          className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#d7b46a]/30 bg-[#d7b46a]/10 text-[#f4d58d]"
        >
          <Gem className="h-6 w-6" />
        </motion.div>
        <p className="mt-4 text-sm text-[#f6ead0]/70">{label}</p>
      </div>
    </div>
  );
}
