import { motion } from "motion/react";
import { MessageCircle } from "lucide-react@0.487.0";

interface FloatingNaniButtonProps {
  onClick: () => void;
}

export function FloatingNaniButton({ onClick }: FloatingNaniButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-[#D6C7F9] to-[#A8D8F9] rounded-full shadow-xl flex items-center justify-center z-50"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: [
          "0 10px 30px rgba(214, 199, 249, 0.4)",
          "0 10px 40px rgba(168, 216, 249, 0.6)",
          "0 10px 30px rgba(214, 199, 249, 0.4)"
        ]
      }}
      transition={{
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      <MessageCircle className="text-white" size={28} />
    </motion.button>
  );
}
