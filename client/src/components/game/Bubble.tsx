import React, { useEffect, useState } from "react";
import { CandyObject } from "@/lib/stores/useCandyGame";
import { motion } from "framer-motion";

interface CandyProps {
  candy: CandyObject;
  size: number;
}

const bubbleColors = {
  red: {
    bg: "#FF3333",
    highlight: "#FF8888",
    shadow: "#CC0000"
  },
  orange: {
    bg: "#FF8800",
    highlight: "#FFBB66",
    shadow: "#CC6600"
  },
  yellow: {
    bg: "#FFDD00",
    highlight: "#FFEE88",
    shadow: "#CC9900"
  },
  green: {
    bg: "#00BB00",
    highlight: "#99EE99",
    shadow: "#008800"
  },
  blue: {
    bg: "#0088FF",
    highlight: "#99CCFF",
    shadow: "#0055BB"
  },
  purple: {
    bg: "#AA00FF",
    highlight: "#DD99FF",
    shadow: "#7700CC"
  }
};

const Bubble: React.FC<CandyProps> = ({ candy, size }) => {
  const [animate, setAnimate] = useState(false);

  // Trigger animations
  useEffect(() => {
    if (candy.isMatched || candy.isNew || candy.isAnimating) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [candy.isMatched, candy.isNew, candy.isAnimating]);

  const colors = bubbleColors[candy.type];
  
  // Special bubble appearance modifications
  const getSpecialBubbleStyles = () => {
    switch (candy.specialType) {
      case "striped-horizontal":
        return {
          background: `linear-gradient(0deg, ${colors.bg}, ${colors.highlight})`,
          boxShadow: `0 0 20px ${colors.highlight}`,
          border: `2px solid rgba(255,255,255,0.7)`
        };
      case "striped-vertical":
        return {
          background: `linear-gradient(90deg, ${colors.bg}, ${colors.highlight})`,
          boxShadow: `0 0 20px ${colors.highlight}`,
          border: `2px solid rgba(255,255,255,0.7)`
        };
      case "wrapped":
        return {
          background: `radial-gradient(circle at 30% 30%, ${colors.highlight}, ${colors.bg})`,
          boxShadow: `0 0 25px ${colors.highlight}`,
          border: `3px solid rgba(255,255,255,0.8)`
        };
      case "color-bomb":
        return {
          background: `radial-gradient(circle, white 15%, ${colors.highlight} 40%, ${colors.bg} 80%)`,
          boxShadow: `0 0 30px ${colors.highlight}, 0 0 50px white`,
          border: `3px solid rgba(255,255,255,0.9)`
        };
      default:
        return {};
    }
  };

  const specialStyles = candy.specialType ? getSpecialBubbleStyles() : {};

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
        className="bubble rounded-full relative overflow-hidden"
        style={{
          width: size * 0.8,
          height: size * 0.8,
          background: `radial-gradient(circle at 30% 30%, ${colors.highlight}cc, ${colors.bg}ff)`,
          boxShadow: candy.isSelected 
            ? `0 0 15px 5px ${colors.highlight}, 0 0 0 3px white` 
            : `inset 0px -10px 20px rgba(0,0,0,0.3), inset 0px 5px 10px rgba(255,255,255,0.5), 0 4px 8px rgba(0,0,0,0.3)`,
          border: candy.isSelected ? `4px solid white` : `2px solid rgba(255,255,255,0.4)`,
          ...specialStyles
        }}
      >
        {/* Shine effect */}
        <div 
          className="absolute left-[15%] top-[15%] rounded-full opacity-80"
          style={{
            width: "30%",
            height: "30%",
            background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)"
          }}
        />
        
        {/* Secondary shine */}
        <div 
          className="absolute right-[25%] bottom-[25%] rounded-full opacity-40"
          style={{
            width: "15%",
            height: "15%",
            background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)"
          }}
        />
      </div>
      
      {/* Match effect particles - water droplets */}
      {candy.isMatched && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              initial={{ opacity: 1, scale: 0.5 }}
              animate={{
                opacity: 0,
                scale: 1.5,
                x: Math.sin(i * Math.PI/5) * size * 1.2,
                y: Math.cos(i * Math.PI/5) * size * 1.2
              }}
              transition={{ duration: 0.5 }}
              className="absolute rounded-full"
              style={{ 
                width: 4 + Math.random() * 4,
                height: 4 + Math.random() * 4,
                background: `radial-gradient(circle at 30% 30%, white, ${colors.highlight})`,
                boxShadow: `0 0 2px rgba(255,255,255,0.8)`
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Bubble;