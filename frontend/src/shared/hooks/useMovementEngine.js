import { useRef, useState, useEffect, useCallback } from 'react';

const useMovementEngine = ({ speed = 5, onUpdate, onFinish }) => {
  const positionRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef(null);
  const animationRef = useRef(null);
  const [isMoving, setIsMoving] = useState(false);

  const tick = useCallback(() => {
    const current = positionRef.current;
    const target = targetRef.current;
    if (!target) return;

    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < speed) {
      positionRef.current = target;
      targetRef.current = null;
      setIsMoving(false);
      onUpdate?.(target);
      onFinish?.(target);
      return;
    }

    const ratio = speed / dist;
    const newX = current.x + dx * ratio;
    const newY = current.y + dy * ratio;

    positionRef.current = { x: newX, y: newY };
    onUpdate?.({ x: newX, y: newY });
    animationRef.current = requestAnimationFrame(tick);
  }, [speed, onUpdate, onFinish]);

  const setTarget = useCallback(
    (pos) => {
      if (
        targetRef.current &&
        targetRef.current.x === pos.x &&
        targetRef.current.y === pos.y
      ) {
        return;
      }

      targetRef.current = pos;
      cancelAnimationFrame(animationRef.current);
      setIsMoving(true);
      animationRef.current = requestAnimationFrame(tick);
    },
    [tick]
  );

  const stopMovement = useCallback(() => {
    cancelAnimationFrame(animationRef.current);
    targetRef.current = null;
    setIsMoving(false);
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  return { positionRef, setTarget, stopMovement, isMoving };
};

export default useMovementEngine;
