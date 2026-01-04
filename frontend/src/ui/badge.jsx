import React from "react";
import { cn } from "../../lib/utils";

/**
 * Badge component
 *
 * Variants:
 * - default
 * - outline
 * - secondary
 * - destructive
 */

const badgeVariants = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary/80",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/80",
  outline:
    "border border-border text-foreground bg-transparent",
};

export function Badge({
  className,
  variant = "default",
  ...props
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}
