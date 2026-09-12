import { useEffect } from "react";
import logo from "@/assets/paymerchlogo.png.asset.json";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(onComplete, prefersReducedMotion ? 500 : 1800);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-background px-8 text-center">
      <img
        src={logo.url}
        alt="Paymerch — Simply Secure Payments"
        className="h-28 w-auto object-contain motion-safe:animate-pulse"
      />
      <p className="mt-7 max-w-xs text-sm font-semibold leading-6 text-foreground">
        Simple payments for every informal trader
      </p>
      <p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">
        Built for spaza shops, street vendors, car washes, food stalls, tshisa nyama and fresh produce sellers.
      </p>
      <div className="absolute bottom-10 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="size-2 rounded-full bg-success motion-safe:animate-pulse" />
        Works online and offline
      </div>
    </div>
  );
}