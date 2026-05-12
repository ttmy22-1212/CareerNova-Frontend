import { MouseEventHandler, useCallback, useState } from "react";
import { useDebounce } from "@/hooks/use_debounce";

const useDragScroll = (el: HTMLDivElement | null) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [isClickDisabled, setIsClickDisabled] = useState(false);

  const isDraggingDebounced = useDebounce(isDragging, 200);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (el) {
        setIsDragging(true);
        setStartX(e.pageX - el.offsetLeft);
        setStartY(e.pageY - el.offsetTop);
        setScrollLeft(el.scrollLeft);
        setScrollTop(el.scrollTop);
      }
    },
    [el]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;

      if (el) {
        const x = e.pageX - el.offsetLeft;
        const y = e.pageY - el.offsetTop;
        const walkX = (x - startX) * 1.5; // adjust this multiplier for horizontal scroll speed
        const walkY = (y - startY) * 1.5; // adjust this multiplier for vertical scroll speed
        el.scrollLeft = scrollLeft - walkX;
        el.scrollTop = scrollTop - walkY;
        if (Math.abs(x - startX) > 5 || Math.abs(y - startY) > 5) {
          setIsClickDisabled(true); // If mouse moves >5px in any direction, consider it a drag
        }
      }
    },
    [isDragging, el, startX, startY, scrollLeft, scrollTop]
  );

  const handleMouseUp: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (isClickDisabled) {
        e.stopPropagation(); // prevent click event if it was a drag
      }
      setIsDragging(false);
    },
    [isClickDisabled]
  );

  const handleMouseLeave: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (isClickDisabled) {
        e.stopPropagation(); // prevent click event if it was a drag
      }
      setIsDragging(false); // stop dragging if mouse leaves the container
    },
    [isClickDisabled]
  );

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    isDragging,

    isClickDisabled: isClickDisabled && isDraggingDebounced,
  };
};

export default useDragScroll;
