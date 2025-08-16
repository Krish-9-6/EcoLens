'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { getLandingConfig } from '<ecolens>/lib/landing-config';
import { useAnimationPerformance } from '<ecolens>/lib/performance-monitor';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  className = '',
}: ScrollRevealProps) {
  const ref = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const config = getLandingConfig();
  const { optimizedSettings } = useAnimationPerformance();
  
  // Adjust threshold for mobile devices
  const adjustedThreshold = isMobile ? Math.max(0.05, threshold * 0.5) : threshold;
  
  const isInView = useInView(ref, { 
    amount: adjustedThreshold,
    once: true // Only animate once when entering viewport
  });

  useEffect(() => {
    // Check for mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // If animations are disabled, don't animate
  if (!config.enableAnimations) {
    return <div className={className} aria-live="polite">{children}</div>;
  }

  // Reduce animation distance on mobile for better performance
  const animationDistance = isMobile ? 20 : optimizedSettings.enableComplexAnimations ? 50 : 30;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: animationDistance }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: animationDistance }}
      transition={{
        duration: isMobile ? Math.min(duration, 0.4) : duration,
        delay: config.enableAnimations ? delay : 0,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={className}
      aria-live="polite"
    >
      {children}
    </motion.div>
  );
}