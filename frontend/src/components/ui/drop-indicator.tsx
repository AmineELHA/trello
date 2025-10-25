import { useDroppable } from "@dnd-kit/core";

interface DropIndicatorProps {
  id: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function DropIndicator({ id, className = '', orientation = 'horizontal' }: DropIndicatorProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  if (!isOver) return null;

  return (
    <div
      ref={setNodeRef}
      className={`bg-blue-500 rounded absolute ${
        orientation === 'horizontal' 
          ? 'w-0.5 h-full left-0 top-0' 
          : 'h-0.5 w-full top-0 left-0'
      } ${className}`}
    />
  );
}