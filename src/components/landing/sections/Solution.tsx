'use client';

import { motion } from 'framer-motion';
import ScrollReveal from '../ui/ScrollReveal';

const steps = [
  {
    title: 'Map Your Chain',
    subtitle: 'MAP',
    description: 'Visualize your entire supply network from raw materials to finished products. Our platform maps every connection, supplier relationship, and production step to create a comprehensive view of your supply chain.',
  },
  {
    title: 'Anchor Your Claims',
    subtitle: 'VERIFY',
    description: 'Secure your sustainability claims with blockchain verification. Our pragmatic anchoring approach provides cryptographic proof without the complexity and cost of full blockchain implementation.',
  },
  {
    title: 'Tell Your Story',
    subtitle: 'REVEAL',
    description: 'Generate beautiful Digital Product Passports that tell the complete story of your products. Share verified information with consumers through scannable QR codes and interactive experiences.',
  },
];

// Simple Numbered Icons
const NumberIcon = ({ number }: { number: number }) => (
  <motion.div
    className="relative w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ duration: 0.5, delay: 0.2 + (number - 1) * 0.1 }}
    whileHover={{ scale: 1.1 }}
  >
    {number}
  </motion.div>
);

export default function Solution() {
  return (
    <section 
      className="py-24 bg-black"
      aria-labelledby="solution-heading"
      role="region"
      aria-label="EcoLens solution process"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12 sm:mb-16 px-4">
            <motion.h2 
              id="solution-heading" 
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              Our 3-Step Process to Radical Transparency
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Transform your supply chain from opaque to transparent with our proven methodology
            </motion.p>
          </div>
        </ScrollReveal>

        {/* Connected Visual Journey */}
        <div className="relative">
          {/* Connecting Line */}
          <motion.div
            className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400/20 via-emerald-400 to-emerald-400/20 transform -translate-y-1/2 z-0"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            viewport={{ once: true }}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 relative z-10" role="list" aria-label="Three-step solution process">
            {steps.map((step, index) => (
              <ScrollReveal
                key={step.subtitle}
                delay={index * 0.2}
                className="text-center"
              >
                <motion.div
                  className="bg-slate-100 rounded-2xl p-6 sm:p-8 h-full flex flex-col items-center touch-manipulation focus-within:ring-2 focus-within:ring-emerald-400 focus-within:ring-offset-2 border border-slate-200 shadow-lg relative"
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  role="listitem"
                  tabIndex={0}
                  aria-labelledby={`step-${index + 1}-title`}
                  aria-describedby={`step-${index + 1}-description`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {/* Number Icon */}
                  <div className="mb-4 sm:mb-6" aria-hidden="true">
                    <NumberIcon number={index + 1} />
                  </div>

                  {/* Step Number/Subtitle */}
                  <motion.div 
                    className="text-xs sm:text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-2" 
                    aria-label={`Step ${index + 1}`}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {step.subtitle}
                  </motion.div>

                  {/* Title */}
                  <motion.h3 
                    id={`step-${index + 1}-title`} 
                    className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {step.title}
                  </motion.h3>

                  {/* Description */}
                  <motion.p 
                    id={`step-${index + 1}-description`} 
                    className="text-sm sm:text-base text-slate-700 leading-relaxed flex-grow"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {step.description}
                  </motion.p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}