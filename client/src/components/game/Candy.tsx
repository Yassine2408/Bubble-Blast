import React, { useEffect, useState } from "react";
import { CandyObject } from "@/lib/stores/useCandyGame";
import { motion } from "framer-motion";

interface CandyProps {
  candy: CandyObject;
  size: number;
}

const candyColors = {
  red: {
    bg: "#FF5555",
    highlight: "#FF7777",
    shadow: "#CC3333"
  },
  orange: {
    bg: "#FF9933",
    highlight: "#FFBB55",
    shadow: "#CC7722"
  },
  yellow: {
    bg: "#FFDD44",
    highlight: "#FFEE66",
    shadow: "#CCAA33"
  },
  green: {
    bg: "#44CC44",
    highlight: "#66DD66",
    shadow: "#339933"
  },
  blue: {
    bg: "#3399FF",
    highlight: "#55BBFF",
    shadow: "#2277CC"
  },
  purple: {
    bg: "#9955FF",
    highlight: "#BB77FF",
    shadow: "#7733CC"
  }
};

const Candy: React.FC<CandyProps> = ({ candy, size }) => {
  const [animate, setAnimate] = useState(false);

  // Trigger animations
  useEffect(() => {
    if (candy.isMatched || candy.isNew || candy.isAnimating) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [candy.isMatched, candy.isNew, candy.isAnimating]);

  const colors = candyColors[candy.type];
  
  // Special candy appearance modifications
  const getSpecialCandyStyles = () => {
    switch (candy.specialType) {
      case "striped-horizontal":
        return {
          backgroundImage: `repeating-linear-gradient(0deg, ${colors.shadow}, ${colors.bg} 5px, ${colors.highlight} 10px)`,
          boxShadow: `0 0 10px ${colors.highlight}`
        };
      case "striped-vertical":
        return {
          backgroundImage: `repeating-linear-gradient(90deg, ${colors.shadow}, ${colors.bg} 5px, ${colors.highlight} 10px)`,
          boxShadow: `0 0 10px ${colors.highlight}`
        };
      case "wrapped":
        return {
          backgroundImage: `radial-gradient(circle, ${colors.highlight} 30%, ${colors.bg} 70%)`,
          boxShadow: `0 0 15px ${colors.highlight}`
        };
      case "color-bomb":
        return {
          background: `radial-gradient(circle, white 10%, black 20%, ${colors.bg} 50%, ${colors.highlight} 80%)`,
          boxShadow: `0 0 20px ${colors.highlight}, 0 0 40px white`
        };
      default:
        return {};
    }
  };

  const specialStyles = candy.specialType ? getSpecialCandyStyles() : {};

  return (
    <motion.div
      initial={{ scale: candy.isNew ? 0.5 : 1 }}
      animate={{
        scale: candy.isMatched ? 0 : candy.isSelected ? 1.1 : 1,
        opacity: candy.isMatched ? 0 : 1,
        rotate: candy.isMatched ? 180 : 0,
        y: candy.isAnimating ? [-(size * 0.5), 0] : 0
      }}
      transition={{
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 15
      }}
      className="w-full h-full flex items-center justify-center"
    >
      <div 
        className="candy rounded-full shadow-lg relative overflow-hidden"
        style={{
          width: size * 0.8,
          height: size * 0.8,
          background: colors.bg,
          boxShadow: candy.isSelected 
            ? `0 0 15px 5px ${colors.highlight}, 0 0 0 2px white` 
            : `inset 0 0 10px ${colors.shadow}, 0 4px 8px rgba(0,0,0,0.3)`,
          border: candy.isSelected ? `3px solid white` : `2px solid ${colors.highlight}`,
          ...specialStyles
        }}
      >
        {/* Shine effect */}
        <div 
          className="absolute -top-1/2 -left-1/2 rounded-full opacity-40"
          style={{
            width: "60%",
            height: "60%",
            background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)"
          }}
        />
      </div>
      
      {/* Match effect particles */}
      {candy.isMatched && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              initial={{ opacity: 1, scale: 0.5 }}
              animate={{
                opacity: 0,
                scale: 1.5,
                x: Math.sin(i * Math.PI/4) * size,
                y: Math.cos(i * Math.PI/4) * size
              }}
              transition={{ duration: 0.5 }}
              className="absolute w-2 h-2 rounded-full"
              style={{ background: colors.highlight }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Candy;
