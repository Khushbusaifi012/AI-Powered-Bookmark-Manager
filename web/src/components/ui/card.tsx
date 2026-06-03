import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mm-surface rounded-2xl shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
