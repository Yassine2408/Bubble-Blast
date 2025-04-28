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
  type: 'bubble' | 'droplet' | 'splash';
}

const SpecialEffects: React.FC = () => {
  const { score, combo } = useCandyGame();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [comboEffect, setComboEffect] = useState<{ active: boolean, value: number }>({ 
    active: false, 
    value: 0 
  });
  
  const bubbleColors = ["#FF6B6B", "#FF9F4A", "#FFE66D", "#4ECDC4", "#3F88C5", "#7CB9E8"];
  
  // Generate particles when score changes
  useEffect(() => {
    // Don't generate particles on initial load
    if (score === 0) return;
    
    // Generate random particles
    const newParticles: Particle[] = [];
    const count = Math.min(15, Math.floor(score / 100) + 5);
    
    for (let i = 0; i < count; i++) {
      // Randomly choose particle type
      const particleType = Math.random() > 0.7 
        ? 'droplet' 
        : Math.random() > 0.4 ? 'splash' : 'bubble';
      
      newParticles.push({
        id: `particle-${Date.now()}-${i}`,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.5 + 0.5,
        rotation: Math.random() * 360,
        color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
        type: particleType
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

  // Render different particle types
  const renderParticle = (particle: Particle) => {
    switch (particle.type) {
      case 'bubble':
        return (
          <div 
            style={{ 
              position: "absolute",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: `radial-gradient(circle at 30% 30%, ${particle.color}cc, ${particle.color}ff)`,
              boxShadow: `inset 0px -3px 5px rgba(0,0,0,0.3), inset 0px 2px 5px rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.3)`,
              border: `1px solid rgba(255,255,255,0.3)`
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
          </div>
        );
      
      case 'droplet':
        return (
          <div
            style={{
              position: "absolute",
              width: "14px",
              height: "18px",
              borderRadius: "70% 70% 60% 60% / 70% 70% 40% 40%",
              background: `radial-gradient(circle at 40% 40%, rgba(255,255,255,0.8), ${particle.color}ee)`,
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              transform: "rotate(20deg)",
            }}
          />
        );
        
      case 'splash':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" style={{ position: "absolute" }}>
            <circle cx="12" cy="12" r="2" fill="rgba(255,255,255,0.8)" />
            <g stroke={particle.color} strokeWidth="1.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="7" />
              <line x1="12" y1="17" x2="12" y2="19" />
              <line x1="5" y1="12" x2="7" y2="12" />
              <line x1="17" y1="12" x2="19" y2="12" />
              <line x1="7.5" y1="7.5" x2="9" y2="9" />
              <line x1="15" y1="15" x2="16.5" y2="16.5" />
              <line x1="7.5" y1="16.5" x2="9" y2="15" />
              <line x1="15" y1="9" x2="16.5" y2="7.5" />
            </g>
          </svg>
        );
        
      default:
        return null;
    }
  };
  
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
            transition={{ 
              duration: 2, 
              ease: "easeOut",
              opacity: {
                times: [0, 0.2, 1],
                duration: 2
              }
            }}
          >
            {renderParticle(particle)}
          </motion.div>
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
                color: "#7CB9E8",
                textShadow: "0 0 10px rgba(124,185,232,0.7), 0 0 20px rgba(124,185,232,0.5), 0 2px 0 #3F88C5, 0 4px 0 rgba(0,0,0,0.2)"
              }}
            >
              {comboEffect.value}x SPLASH!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpecialEffects;
