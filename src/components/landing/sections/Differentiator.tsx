'use client';

import { XCircle, CheckCircle2 } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';

export default function Differentiator() {
  return (
    <section 
      className="py-24 bg-black"
      aria-labelledby="differentiator-heading"
      role="region"
      aria-label="EcoLens competitive advantage"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12 sm:mb-16 px-4">
            <h2 id="differentiator-heading" className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 sm:mb-6 leading-tight">
              The &apos;Secret Sauce&apos;: Pragmatic Anchoring
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Why settle for slow, expensive blockchain when you can have instant, 
              low-cost verification that scales with your business?
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12" role="comparison" aria-label="Comparison between Full Blockchain and Pragmatic Anchoring">
            {/* Full Blockchain Column */}
            <div className="bg-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg" role="group" aria-labelledby="blockchain-heading">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0" aria-hidden="true">
                  <XCircle className="w-5 sm:w-6 h-5 sm:h-6 text-amber-600" />
                </div>
                <h3 id="blockchain-heading" className="text-xl sm:text-2xl font-bold text-slate-900">Full Blockchain</h3>
              </div>
              
              <ul className="space-y-3 sm:space-y-4" role="list" aria-label="Full blockchain disadvantages">
                <li className="flex items-start" role="listitem">
                  <XCircle className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm sm:text-base text-slate-700">
                    <strong>Slow:</strong> Minutes to hours for transaction confirmation
                  </span>
                </li>
                <li className="flex items-start" role="listitem">
                  <XCircle className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm sm:text-base text-slate-700">
                    <strong>Expensive:</strong> High gas fees for every transaction
                  </span>
                </li>
                <li className="flex items-start" role="listitem">
                  <XCircle className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm sm:text-base text-slate-700">
                    <strong>Complex:</strong> Requires deep blockchain expertise
                  </span>
                </li>
                <li className="flex items-start" role="listitem">
                  <XCircle className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm sm:text-base text-slate-700">
                    <strong>Rigid:</strong> Difficult to update or modify data
                  </span>
                </li>
              </ul>
            </div>

            {/* Pragmatic Anchoring Column */}
            <div className="bg-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-lg" role="group" aria-labelledby="anchoring-heading">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0" aria-hidden="true">
                  <CheckCircle2 className="w-5 sm:w-6 h-5 sm:h-6 text-emerald-600" />
                </div>
                <h3 id="anchoring-heading" className="text-xl sm:text-2xl font-bold text-slate-900">Pragmatic Anchoring</h3>
              </div>
              
              <ul className="space-y-3 sm:space-y-4" role="list" aria-label="Pragmatic anchoring advantages">
                <li className="flex items-start" role="listitem">
                  <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm sm:text-base text-slate-700">
                    <strong>Instant:</strong> Real-time verification and updates
                  </span>
                </li>
                <li className="flex items-start" role="listitem">
                  <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm sm:text-base text-slate-700">
                    <strong>Low-cost:</strong> Minimal fees for maximum value
                  </span>
                </li>
                <li className="flex items-start" role="listitem">
                  <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm sm:text-base text-slate-700">
                    <strong>Scalable:</strong> Grows seamlessly with your business
                  </span>
                </li>
                <li className="flex items-start" role="listitem">
                  <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-500 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm sm:text-base text-slate-700">
                    <strong>Flexible:</strong> Easy to update and maintain data integrity
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}