'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

// Optimized page transition with reduced complexity for better performance
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { 
    type: "tween" as const, 
    ease: "easeOut" as const, 
    duration: 0.2 // Reduced from 0.3 for faster transitions
  }
}

// Simplified item variants for better performance
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "tween" as const, 
      ease: "easeOut" as const, 
      duration: 0.15 // Reduced from 0.2 for faster animations
    }
  }
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggeredListProps {
  children: ReactNode
  className?: string
  tableContext?: boolean
}

export function StaggeredList({ children, className = "", tableContext = false }: StaggeredListProps) {
  const Container = tableContext ? 'tbody' : 'div'
  
  return (
    <Container className={className}>
      <AnimatePresence mode="wait">
        {Array.isArray(children) ? children.map((child, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.05 }} // Reduced delay for faster appearance
            className={tableContext ? undefined : "block"}
          >
            {child}
          </motion.div>
        )) : (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className={tableContext ? undefined : "block"}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  )
}

// Fast fade transition for simple elements
export function FastFade({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }} // Very fast transition
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Instant transition for critical UI elements
export function InstantTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}
