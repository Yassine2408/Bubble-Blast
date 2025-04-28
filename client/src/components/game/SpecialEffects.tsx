import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCandyGame } from "@/lib/stores/useCandyGame";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface Particle {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color: string;
  type: 'droplet' | 'splash' | 'bubble';
}

const SpecialEffects: React.FC = () => {
  const { score, combo } = useCandyGame();
  const isMobile = useIsMobile();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [comboEffect, setComboEffect] = useState<{ active: boolean, value: number }>({ 
    active: false, 
    value: 0 
  });
  
  const bubbleColors = useMemo(() => 
    ["#FF3333", "#FF8800", "#FFDD00", "#00BB00", "#0088FF", "#AA00FF"],
    []
  );
  
  // Generate particles when score changes with mobile optimization
  useEffect(() => {
    if (score === 0) return;
    
    // Reduce particle count on mobile
    const maxParticles = isMobile ? 8 : 15;
    const count = Math.min(maxParticles, Math.floor(score / 100) + 5);
    
    const newParticles: Particle[] = Array(count).fill(null).map((_, i) => {
      const particleType = Math.random() > 0.7 
        ? 'droplet' 
        : Math.random() > 0.4 ? 'splash' : 'bubble';
      
      return {
        id: `particle-${Date.now()}-${i}`,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.5 + 0.5,
        rotation: Math.random() * 360,
        color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
        type: particleType
      };
    });
    
    setParticles(prev => [...prev, ...newParticles]);
    
    // Shorter animation duration on mobile
    const duration = isMobile ? 1500 : 2000;
    const timer = setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, duration);
    
    return () => clearTimeout(timer);
  }, [score, isMobile, bubbleColors]);
  
  // Optimized combo effect
  useEffect(() => {
    if (combo >= 2) {
      setComboEffect({ active: true, value: combo });
      
      const duration = isMobile ? 1000 : 1500;
      const timer = setTimeout(() => {
        setComboEffect({ active: false, value: 0 });
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [combo, isMobile]);

  // Memoized particle renderer
  const renderParticle = useCallback((particle: Particle) => {
    const size = isMobile ? '0.5rem' : '0.75rem';
    
    switch (particle.type) {
      case 'droplet':
        return (
          <div
            className="rounded-full"
            style={{
              width: size,
              height: size,
              background: `radial-gradient(circle at 30% 30%, white, ${particle.color})`,
              boxShadow: `0 0 5px ${particle.color}`,
            }}
          />
        );
      case 'splash':
        return (
          <div
            className="transform rotate-45"
            style={{
              width: size,
              height: size,
              background: `radial-gradient(circle at 30% 30%, white, ${particle.color})`,
              clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
            }}
          />
        );
      default: // bubble
        return (
          <div
            className="rounded-full"
            style={{
              width: size,
              height: size,
              background: `radial-gradient(circle at 30% 30%, ${particle.color}88, ${particle.color}ff)`,
              border: '1px solid rgba(255,255,255,0.4)',
              boxShadow: 'inset 0px -2px 5px rgba(0,0,0,0.2), inset 0px 2px 5px rgba(255,255,255,0.2)',
            }}
          />
        );
    }
  }, [isMobile]);

  return (
    <div className="special-effects absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating particles with optimized animations */}
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
              y: particle.y - (isMobile ? 50 : 100), 
              scale: particle.scale,
              rotate: particle.rotation,
              opacity: [0, 1, 0] 
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: isMobile ? 1.5 : 2,
              ease: "easeOut",
              opacity: {
                times: [0, 0.2, 1],
                duration: isMobile ? 1.5 : 2
              }
            }}
            style={{
              position: 'absolute',
              willChange: 'transform',
              transform: 'translateZ(0)',
            }}
          >
            {renderParticle(particle)}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Optimized combo text effect */}
      <AnimatePresence>
        {comboEffect.active && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1.2, opacity: 1, y: 0 }}
            exit={{ scale: 2, opacity: 0, y: -50 }}
            transition={{ 
              duration: isMobile ? 1 : 1.5,
              type: "spring",
              stiffness: 200,
              damping: 15 
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)',
            }}
          >
            <div 
              className={`font-bold ${isMobile ? 'text-3xl' : 'text-4xl md:text-6xl'}`}
              style={{
                color: "#0088FF",
                textShadow: "0 0 10px rgba(0,136,255,0.7), 0 0 20px rgba(0,136,255,0.5), 0 2px 0 #0055BB, 0 4px 0 rgba(0,0,0,0.2)"
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

export default React.memo(SpecialEffects);
