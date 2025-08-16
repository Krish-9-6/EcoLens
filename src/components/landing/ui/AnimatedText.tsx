'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedTextProps {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
  staggerChildren?: number;
  animationType?: 'fadeInUp' | 'fadeIn' | 'typewriter';
}

export default function AnimatedText({
  text,
  delay = 0,
  duration = 0.6,
  className = '',
  staggerChildren = 0.05,
  animationType = 'fadeInUp',
}: AnimatedTextProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion setting
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // If user prefers reduced motion, render static text
  if (prefersReducedMotion) {
    return <div className={className}>{text}</div>;
  }

  // Split text into words for animation
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        staggerChildren,
        delayChildren: delay,
      },
    },
  };

  const getWordVariants = () => {
    switch (animationType) {
      case 'fadeIn':
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { duration },
          },
        };
      case 'typewriter':
        return {
          hidden: { opacity: 0, width: 0 },
          visible: {
            opacity: 1,
            width: 'auto',
            transition: { duration },
          },
        };
      case 'fadeInUp':
      default:
        return {
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration },
          },
        };
    }
  };

  const wordVariants = getWordVariants();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={wordVariants}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}