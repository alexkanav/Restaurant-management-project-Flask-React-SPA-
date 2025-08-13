import React, { useRef, useState, useEffect } from "react";
import { useDragScroll } from '../../hooks/useDragScroll';
import "./DragScrollMenu.css";


export default function DragScrollMenu({ categories }) {
  const itemRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollToggle, setScrollToggle] = useState(false);

  const {
    containerRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useDragScroll()

  // Scroll to the corresponding section when a menu item is clicked
  const handleClick = (index) => {
    const el = document.getElementById(`category_${index}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };


  // Basic debounce utility to reduce scroll-triggered state changes
  function debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  // Used to trigger `IntersectionObserver` recalculation when scroll ends
  useEffect(() => {
    const handleScroll = debounce(() => {
      setScrollToggle(prev => !prev); // Toggle to retrigger observer effect
    }, 500);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id; // e.g., "category_3"
            const index = parseInt(id.split("_")[1]);
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    const sections = document.querySelectorAll("[id^='category_']");
    sections.forEach((section) => observer.observe(section));

    // 👇 Scroll the active nav item into view
    itemRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });

    return () => observer.disconnect();
  }, [scrollToggle]);

  return (
    <div className="nav-scroller">
      <div
        className="dragscroll-container"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {categories.map((category, idx) => (
          <div
            key={idx}
            ref={(el) => (itemRefs.current[idx] = el)}
            className={`nav-scr ${idx === activeIndex ? "butcol" : ""}`}
            onClick={() => handleClick(idx)}
          >
            {category}
          </div>
        ))}
      </div>
    </div>
  );
}