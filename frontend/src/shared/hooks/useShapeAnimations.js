import { useCallback, useRef, useEffect } from 'react';

const useShapeAnimations = (setShapes) => {
  const animationsRef = useRef({});

  useEffect(() => {
    return () => {
      Object.values(animationsRef.current).forEach(cancelAnimationFrame);
    };
  }, []);

  const animateShape = useCallback(
    (shapeId, targetX, targetY, duration = 1000) => {
      if (animationsRef.current[shapeId]) {
        cancelAnimationFrame(animationsRef.current[shapeId]);
      }

      setShapes((prevShapes) => {
        const shape = prevShapes.find((s) => s.id === shapeId);
        if (!shape) return prevShapes;

        const startX = shape.x;
        const startY = shape.y;
        const deltaX = targetX - startX;
        const deltaY = targetY - startY;
        let startTime = null;

        const step = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);

          const currentX = startX + deltaX * progress;
          const currentY = startY + deltaY * progress;

          setShapes((prev) =>
            prev.map((s) =>
              s.id === shapeId ? { ...s, x: currentX, y: currentY } : s
            )
          );

          if (progress < 1) {
            animationsRef.current[shapeId] = requestAnimationFrame(step);
          } else {
            delete animationsRef.current[shapeId];
          }
        };

        animationsRef.current[shapeId] = requestAnimationFrame(step);
        return prevShapes;
      });
    },
    [setShapes]
  );

  return animateShape;
};

export default useShapeAnimations;
