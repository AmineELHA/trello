import React from 'react';

interface DropIndicatorProps {
  children?: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const DropIndicator: React.FC<DropIndicatorProps> = ({ 
  children, 
  className = '',
  orientation = 'vertical'
}) => {
  const isVertical = orientation === 'vertical';
  
  return (
    <div className={`
      relative
      ${isVertical ? 'my-1' : 'mx-1'}
      ${className}
    `}>
      <div className={`
        absolute 
        ${isVertical 
          ? 'left-0 right-0 h-0.5 bg-blue-500' 
          : 'top-0 bottom-0 w-0.5 bg-blue-500'}
        ${isVertical ? '-top-0.5' : '-left-0.5'}
        rounded-full
      `}></div>
      {children}
    </div>
  );
};

export default DropIndicator;