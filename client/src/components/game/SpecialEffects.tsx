import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCandyGame } from "@/lib/stores/useCandyGame";

interface Particle {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color: string;
}

const SpecialEffects: React.FC = () => {
  const { score, combo } = useCandyGame();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [comboEffect, setComboEffect] = useState<{ active: boolean, value: number }>({ 
    active: false, 
    value: 0 
  });
  
  const colors = ["#FF5555", "#FF9933", "#FFDD44", "#44CC44", "#3399FF", "#9955FF"];
  
  // Generate particles when score changes
  useEffect(() => {
    // Don't generate particles on initial load
    if (score === 0) return;
    
    // Generate random particles
    const newParticles: Particle[] = [];
    const count = Math.min(15, Math.floor(score / 100) + 5);
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: `particle-${Date.now()}-${i}`,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.5 + 0.5,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
    
    // Remove particles after animation
    const timer = setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [score]);
  
  // Show combo effect
  useEffect(() => {
    if (combo >= 2) {
      setComboEffect({ active: true, value: combo });
      
      const timer = setTimeout(() => {
        setComboEffect({ active: false, value: 0 });
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [combo]);
  
  return (
    <div className="special-effects absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: particle.x, 
              y: particle.y,
              scale: 0,
              rotate: 0,
              opacity: 0 
            }}
            animate={{ 
              y: particle.y - 100, 
              scale: particle.scale,
              rotate: particle.rotation,
              opacity: [0, 1, 0] 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            style={{ 
              position: "absolute",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: particle.color
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* Combo text effect */}
      <AnimatePresence>
        {comboEffect.active && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1.2, opacity: 1, y: 0 }}
            exit={{ scale: 2, opacity: 0, y: -50 }}
            transition={{ 
              duration: 1.5,
              type: "spring",
              stiffness: 200,
              damping: 15 
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div 
              className="text-4xl md:text-6xl font-bold"
              style={{
                color: "#FFDD44",
                textShadow: "0 0 10px rgba(255,221,68,0.7), 0 0 20px rgba(255,221,68,0.5), 0 2px 0 #CC7722, 0 4px 0 rgba(0,0,0,0.2)"
              }}
            >
              {comboEffect.value}x COMBO!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpecialEffects;
