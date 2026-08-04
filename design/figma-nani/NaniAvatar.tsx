import { motion } from "motion/react";
import { Cloud, Smile } from "lucide-react@0.487.0";

interface NaniAvatarProps {
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export function NaniAvatar({ size = "md", animate = true }: NaniAvatarProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32"
  };

  const iconSizes = {
    sm: 24,
    md: 40,
    lg: 64
  };

  const CloudComponent = animate ? motion.div : "div";

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <CloudComponent
        className="absolute inset-0 flex items-center justify-center"
        animate={animate ? {
          y: [0, -8, 0],
        } : undefined}
        transition={animate ? {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        } : undefined}
      >
        {/* Nube de fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#D6C7F9] to-[#A8D8F9] rounded-full shadow-lg" />
        
        {/* Rostro de Nani */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {/* Ojos */}
          <div className="flex gap-2 mb-1">
            <div className="w-2 h-2 bg-white rounded-full" />
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          {/* Sonrisa */}
          <div className="w-6 h-3 border-b-2 border-white rounded-full" />
        </div>
      </CloudComponent>
    </div>
  );
}
