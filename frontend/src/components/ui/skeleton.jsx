import React from "react";
import { cn } from "@/lib/utils"; // or remove this if not using `cn`

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
    />
  );
}
