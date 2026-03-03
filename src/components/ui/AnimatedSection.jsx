import { useRef } from 'react';
import { cn } from '@/lib/utils';
import useInView from '@/hooks/useInView';

/**
 * Shared scroll-triggered animation wrapper.
 * Used across landing, pricing, and other marketing pages.
 */
export default function AnimatedSection({ children, className = '', delay = 0 }) {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={cn(
        'opacity-0 translate-y-6 transition-all duration-700 ease-out',
        isInView && 'opacity-100 translate-y-0',
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
