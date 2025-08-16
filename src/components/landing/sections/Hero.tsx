'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '<ecolens>/components/ui/button';
import AnimatedText from '../ui/AnimatedText';
import { getLandingConfig } from '<ecolens>/lib/landing-config';
import { useAnimationPerformance } from '<ecolens>/lib/performance-monitor';

interface HeroProps {
  demoProductId?: string;
}

export default function Hero({ demoProductId }: HeroProps) {
  const config = getLandingConfig();
  const { startMonitoring, stopMonitoring, optimizedSettings } = useAnimationPerformance();
  
  // Use provided prop, config, or fallback
  const productId = demoProductId || config.demoProductId;

  // Monitor animation performance
  useEffect(() => {
    if (config.enableAnimations) {
      startMonitoring();
      
      // Stop monitoring after animations complete
      const timer = setTimeout(() => {
        const metrics = stopMonitoring();
        if (metrics.isLowPerformance) {
          console.warn('Low animation performance detected:', metrics);
        }
      }, 2000); // Monitor for 2 seconds after component mounts

      return () => {
        clearTimeout(timer);
        stopMonitoring();
      };
    }
  }, [config.enableAnimations, startMonitoring, stopMonitoring]);

  return (
    <section 
      className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden"
      aria-labelledby="hero-heading"
      role="banner"
    >
      {/* Enhanced Background Pattern - Fashion-Tech Noir theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black" />
      
      {/* Animated geometric patterns */}
      <div className="absolute inset-0 opacity-10">
        <motion.div 
          className="absolute top-20 left-20 w-32 h-32 border border-emerald-400/30 rounded-full"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute top-40 right-32 w-24 h-24 border border-emerald-400/30 rotate-45"
          animate={{ 
            rotate: [45, 225, 45],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-32 left-1/4 w-20 h-20 border border-emerald-400/30 rounded-full"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-28 h-28 border border-emerald-400/30 rotate-12"
          animate={{ 
            rotate: [12, 372, 12],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
      </div>
      
      {/* Enhanced data visualization lines */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path 
            d="M0,50 Q25,30 50,50 T100,50" 
            stroke="#00FF85" 
            strokeWidth="0.5" 
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          <motion.path 
            d="M0,60 Q25,40 50,60 T100,60" 
            stroke="#00FF85" 
            strokeWidth="0.5" 
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
          />
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Enhanced Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: config.enableAnimations ? optimizedSettings.duration : 0.1, 
            ease: [0.4, 0, 0.2, 1] 
          }}
        >
          <h1 id="hero-heading" className="font-heading">
            <AnimatedText
              text="Weave Trust Into Every Thread"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight mb-6 sm:mb-8 px-2 bg-gradient-to-r from-white via-emerald-400 to-emerald-500 bg-clip-text text-transparent"
              delay={0}
              duration={0.8}
              staggerChildren={0.1}
            />
          </h1>
        </motion.div>

        {/* Enhanced Sub-headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: config.enableAnimations ? optimizedSettings.duration : 0.1, 
            delay: config.enableAnimations ? 0.3 : 0, 
            ease: [0.4, 0, 0.2, 1] 
          }}
        >
          <div aria-describedby="hero-heading" className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-slate-300 mb-10 sm:mb-16 max-w-4xl mx-auto px-2 leading-relaxed">
            <AnimatedText
              text="EcoLens transforms complex supply chains into verifiable stories, making transparency as essential as every stitch in your brand."
              delay={0.3}
              duration={0.8}
              staggerChildren={0.05}
            />
          </div>
        </motion.div>

        {/* Enhanced CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: config.enableAnimations ? optimizedSettings.duration : 0.1, 
            delay: config.enableAnimations ? 0.6 : 0, 
            ease: [0.4, 0, 0.2, 1] 
          }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full max-w-lg sm:max-w-none mx-auto"
          role="group"
          aria-label="Call to action buttons"
        >
          {/* Get a Demo Button - Primary CTA with unified styling */}
          <Button
            asChild
            variant="default"
            size="xl"
            className="w-full sm:w-auto font-heading font-bold"
          >
            <Link href="/contact" aria-label="Get a demo of EcoLens platform">
              Get a Demo
            </Link>
          </Button>

          {/* See it in Action Button - Secondary CTA with unified styling */}
          <Button
            asChild
            variant="outline"
            size="xl"
            className="w-full sm:w-auto font-heading font-semibold"
          >
            <Link href={`/dpp/${productId}`} aria-label="View a demo Digital Product Passport">
              See it in Action
            </Link>
          </Button>
        </motion.div>

        {/* Enhanced Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: config.enableAnimations ? optimizedSettings.duration : 0.1, 
            delay: config.enableAnimations ? 0.9 : 0, 
            ease: [0.4, 0, 0.2, 1] 
          }}
          className="mt-16 flex flex-wrap justify-center items-center gap-8 text-sm text-slate-400"
        >
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 bg-emerald-400 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <span>Blockchain Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 bg-emerald-400 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2, 
                delay: 0.5,
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <span>Real-time Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.div 
              className="w-2 h-2 bg-emerald-400 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2, 
                delay: 1,
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <span>Enterprise Ready</span>
          </div>
        </motion.div>
      </div>

      {/* Enhanced scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        aria-label="Scroll down to see more content"
        role="img"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-emerald-400/50 rounded-full flex justify-center"
          aria-hidden="true"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-3 bg-emerald-400 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}