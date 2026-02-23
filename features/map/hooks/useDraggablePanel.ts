import { useState, useEffect, useRef } from 'react';

export function useDraggablePanel(defaultX: number, defaultY: number, defaultW: number, defaultH: number) {
  const [position, setPosition] = useState({ x: defaultX, y: defaultY });
  const [size, setSize] = useState({ w: defaultW, h: defaultH });

  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0, mouseX: 0, mouseY: 0 });
  const startSize = useRef({ w: 0, h: 0, mouseX: 0, mouseY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        setPosition({
          x: startPos.current.x + (e.clientX - startPos.current.mouseX),
          y: Math.max(0, startPos.current.y + (e.clientY - startPos.current.mouseY)),
        });
      } else if (isResizing.current) {
        setSize({
          w: Math.max(350, startSize.current.w + (e.clientX - startSize.current.mouseX)),
          h: Math.max(300, startSize.current.h + (e.clientY - startSize.current.mouseY)),
        });
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      isResizing.current = false;
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const onDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return; 
    isDragging.current = true;
    startPos.current = { x: position.x, y: position.y, mouseX: e.clientX, mouseY: e.clientY };
    document.body.style.userSelect = 'none'; 
  };

  const onResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    isResizing.current = true;
    startSize.current = { w: size.w, h: size.h, mouseX: e.clientX, mouseY: e.clientY };
    document.body.style.userSelect = 'none';
  };

  return { position, size, onDragStart, onResizeStart };
}