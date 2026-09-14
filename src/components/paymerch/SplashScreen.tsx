import { useEffect, type KeyboardEvent, type MouseEvent } from "react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(onComplete, prefersReducedMotion ? 800 : 2200);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  const advanceFromTouch = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>) => {
    event.preventDefault();
    onComplete();
  };

  return (
    <div
      className="splash-screen flex h-full flex-col items-center justify-center bg-background px-8 text-center"
      onClick={advanceFromTouch}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          advanceFromTouch(event);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="splash-logo-wrap">
        <img
          src="/paymerchlogo.png"
          alt="Paymerch"
          className="splash-logo h-56 w-auto object-contain"
        />
      </div>
      <p className="splash-mobile mt-2 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Mobile</p>
      <p className="splash-tagline mt-7 max-w-xs text-sm font-semibold leading-6 text-foreground">
        Simple payments for every informal trader
      </p>
      <p className="splash-description mt-2 max-w-xs text-xs leading-5 text-muted-foreground">
        Built for spaza shops, street vendors, car washes, taxi drivers, food stalls, tshisa nyama and fresh produce sellers.
      </p>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onComplete();
        }}
        className="splash-status mt-6 inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]"
      >
        Get Started
      </button>
      <div className="splash-status absolute bottom-10 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="size-2 rounded-full bg-success motion-safe:animate-pulse" />
        Works online and offline
      </div>
    </div>
  );
}