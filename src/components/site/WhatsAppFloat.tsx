import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function WhatsAppFloat() {
  return (
    <motion.a
      href="https://wa.me/919876543210"
      target="_blank"
      rel="noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring" }}
      whileHover={{ scale: 1.08 }}
      className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full grid place-items-center shadow-luxury animate-float"
      style={{ background: "linear-gradient(135deg, #25D366, #128C7E)", color: "white" }}
      aria-label="WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: "#25D366" }} />
    </motion.a>
  );
}