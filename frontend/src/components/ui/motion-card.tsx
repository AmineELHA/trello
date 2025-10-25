import * as React from "react";
import { motion, type MotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

interface MotionCardProps extends MotionProps {
  className?: string;
}

const MotionCard = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        data-slot="card"
        className={cn(
          "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
          className
        )}
        {...props}
      />
    );
  }
);
MotionCard.displayName = "MotionCard";

const MotionCardHeader = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        data-slot="card-header"
        className={cn(
          "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
          className
        )}
        {...props}
      />
    );
  }
);
MotionCardHeader.displayName = "MotionCardHeader";

const MotionCardTitle = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        data-slot="card-title"
        className={cn("leading-none font-semibold", className)}
        {...props}
      />
    );
  }
);
MotionCardTitle.displayName = "MotionCardTitle";

const MotionCardDescription = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        data-slot="card-description"
        className={cn("text-muted-foreground text-sm", className)}
        {...props}
      />
    );
  }
);
MotionCardDescription.displayName = "MotionCardDescription";

const MotionCardAction = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        data-slot="card-action"
        className={cn(
          "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
          className
        )}
        {...props}
      />
    );
  }
);
MotionCardAction.displayName = "MotionCardAction";

const MotionCardContent = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        data-slot="card-content"
        className={cn("px-6", className)}
        {...props}
      />
    );
  }
);
MotionCardContent.displayName = "MotionCardContent";

const MotionCardFooter = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ className, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        data-slot="card-footer"
        className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
        {...props}
      />
    );
  }
);
MotionCardFooter.displayName = "MotionCardFooter";

export {
  MotionCard,
  MotionCardHeader,
  MotionCardFooter,
  MotionCardTitle,
  MotionCardAction,
  MotionCardDescription,
  MotionCardContent,
};