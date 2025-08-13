import { useRef } from 'react';


export const useDragScroll = () => {
  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    const el = containerRef.current;
    el.isDragging = true;
    el.startX = e.pageX - el.offsetLeft;
    el.scrollLeftStart = el.scrollLeft;
  };

  const handleMouseMove = (e) => {
    const el = containerRef.current;
    if (!el.isDragging) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - el.startX) * 2;
    el.scrollLeft = el.scrollLeftStart - walk;
  };

  const handleMouseUp = () => {
    const el = containerRef.current;
    el.isDragging = false;
  };

  return { containerRef, handleMouseDown, handleMouseMove, handleMouseUp };
};
