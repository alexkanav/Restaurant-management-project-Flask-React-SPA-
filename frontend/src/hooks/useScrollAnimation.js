import React, { useEffect, useRef} from 'react';


export const useScrollAnimation = (threshold = 0.7) => {
  const ref = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('show-content');
          }
        });
      },
      { threshold }
    );

    ref.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      ref.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, [threshold]);

  return ref;
};
