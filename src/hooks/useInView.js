import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight IntersectionObserver hook for scroll-triggered animations.
 * Returns [ref, isInView] — attach ref to the element, use isInView to animate.
 *
 * @param {{ threshold?: number, triggerOnce?: boolean, rootMargin?: string }} options
 */
export default function useInView({
    threshold = 0.15,
    triggerOnce = true,
    rootMargin = '0px 0px -60px 0px',
} = {}) {
    const ref = useRef(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    if (triggerOnce) observer.unobserve(el);
                } else if (!triggerOnce) {
                    setIsInView(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold, triggerOnce, rootMargin]);

    return [ref, isInView];
}
