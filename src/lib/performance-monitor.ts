/**
 * Performance monitoring utilities for landing page animations
 */

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  isLowPerformance: boolean;
}

class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;
  private frameTime = 16.67; // 60fps = ~16.67ms per frame
  private isMonitoring = false;
  private rafId: number | null = null;
  private performanceThreshold = 30; // Consider < 30fps as low performance

  /**
   * Start monitoring frame rate during animations
   */
  startMonitoring(): void {
    if (this.isMonitoring || typeof window === 'undefined') return;
    
    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.monitorFrame();
  }

  /**
   * Stop monitoring and return metrics
   */
  stopMonitoring(): PerformanceMetrics {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.isMonitoring = false;
    
    return {
      fps: this.fps,
      frameTime: this.frameTime,
      isLowPerformance: this.fps < this.performanceThreshold,
    };
  }

  /**
   * Get current performance metrics without stopping monitoring
   */
  getCurrentMetrics(): PerformanceMetrics {
    return {
      fps: this.fps,
      frameTime: this.frameTime,
      isLowPerformance: this.fps < this.performanceThreshold,
    };
  }

  private monitorFrame = (): void => {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    this.frameCount++;

    // Calculate FPS every second
    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameTime = (currentTime - this.lastTime) / this.frameCount;
      
      // Reset counters
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    this.rafId = requestAnimationFrame(this.monitorFrame);
  };

  /**
   * Check if device is likely low-performance based on various factors
   */
  static isLowPerformanceDevice(): boolean {
    if (typeof window === 'undefined') return false;

    // Check for mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Check hardware concurrency (number of CPU cores)
    const lowCoreCount = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

    // Check memory (if available)
    const lowMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory && (navigator as Navigator & { deviceMemory?: number }).deviceMemory! <= 2;

    return prefersReducedMotion || (isMobile && (lowCoreCount || lowMemory));
  }

  /**
   * Get optimized animation settings based on device performance
   */
  static getOptimizedAnimationSettings(): {
    duration: number;
    staggerDelay: number;
    enableComplexAnimations: boolean;
  } {
    const isLowPerformance = this.isLowPerformanceDevice();

    return {
      duration: isLowPerformance ? 0.3 : 0.6,
      staggerDelay: isLowPerformance ? 0.05 : 0.15,
      enableComplexAnimations: !isLowPerformance,
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook to monitor animation performance
 */
export function useAnimationPerformance() {
  const startMonitoring = () => performanceMonitor.startMonitoring();
  const stopMonitoring = () => performanceMonitor.stopMonitoring();
  const getCurrentMetrics = () => performanceMonitor.getCurrentMetrics();

  return {
    startMonitoring,
    stopMonitoring,
    getCurrentMetrics,
    isLowPerformanceDevice: PerformanceMonitor.isLowPerformanceDevice(),
    optimizedSettings: PerformanceMonitor.getOptimizedAnimationSettings(),
  };
}