import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Full-screen paper background with soft color blobs (from the design direction). */
export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative min-h-screen overflow-hidden bg-paper text-ink", className)}>
      <div className="blob -top-16 -left-14 size-60 bg-sun/30" />
      <div className="blob top-24 -right-20 size-72 bg-sea/15" />
      <div className="blob bottom-24 -left-24 size-80 bg-berry/10" />
      <div className="blob top-1/3 right-1/4 size-24 bg-coral/15" />
      <div className="relative">{children}</div>
    </div>
  );
}
