import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export { gsap, ScrollTrigger, useGSAP };

// Big headings slide up from behind a mask (needs <Line> markup)
export function useHeadingReveal(scope, deps = []) {
  useGSAP(
    () => {
      if (!scope.current?.querySelector('[data-line]')) return;
      gsap.from('[data-line]', { yPercent: 110, duration: 1, ease: 'power4.out', stagger: 0.12 });
    },
    { scope, dependencies: deps }
  );
}

// Elements fade/slide in as they scroll into view
export function useReveal(scope, selector, deps = []) {
  useGSAP(
    () => {
      const els = gsap.utils.toArray(selector, scope.current);
      if (!els.length) return;
      gsap.set(els, { y: 50, opacity: 0 });
      ScrollTrigger.batch(els, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
            stagger: 0.1, clearProps: 'all',
          }),
      });
    },
    { scope, dependencies: deps }
  );
}

// Progress bars grow from the left
export function useBars(scope, deps = []) {
  useGSAP(
    () => {
      if (!scope.current?.querySelector('[data-bar]')) return;
      gsap.from('[data-bar]', { scaleX: 0, duration: 1.2, ease: 'power3.out', delay: 0.3, clearProps: 'all' });
    },
    { scope, dependencies: deps }
  );
}