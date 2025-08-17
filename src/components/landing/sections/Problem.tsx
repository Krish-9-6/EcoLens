'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import ScrollReveal from '../ui/ScrollReveal';

// Animated Counter Component
function AnimatedCounter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      let animationFrame: number;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(easeOutQuart * end);
        
        setCount(currentCount);
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
  }, [isInView, end, duration]);

  return (
    <span ref={ref} className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-amber-400 mb-3 sm:mb-4">
      {count}%
    </span>
  );
}

export default function Problem() {
  return (
    <section 
      className="py-20 px-4 bg-black"
      aria-labelledby="problem-heading"
      role="region"
      aria-label="Industry problem statement"
    >
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12 sm:mb-16 px-4">
            <motion.h2 
              id="problem-heading" 
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 sm:mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              The Fashion Industry Has a Trust Problem
            </motion.h2>
          </div>
        </ScrollReveal>
        
        <ScrollReveal delay={0.2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 max-w-4xl mx-auto" role="list" aria-label="Industry transparency statistics">
            {/* 24% Statistic */}
            <motion.div 
              className="text-center px-4" 
              role="listitem"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div 
                className="relative"
                aria-label="Twenty-four percent"
              >
                <AnimatedCounter end={24} duration={2} />
                <motion.div
                  className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  viewport={{ once: true }}
                />
              </div>
              <motion.p 
                className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed max-w-xs mx-auto"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                Average score on the Fashion Transparency Index
              </motion.p>
            </motion.div>
            
            {/* 85% Statistic */}
            <motion.div 
              className="text-center px-4" 
              role="listitem"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <div 
                className="relative"
                aria-label="Eighty-five percent"
              >
                <AnimatedCounter end={85} duration={2.5} />
                <motion.div
                  className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.7 }}
                  viewport={{ once: true }}
                />
              </div>
              <motion.p 
                className="text-base sm:text-lg md:text-xl text-slate-300 leading-relaxed max-w-xs mx-auto"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Of major brands fail to disclose annual production volumes
              </motion.p>
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}