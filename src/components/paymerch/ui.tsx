import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: "SUCCESS" | "PENDING" | "FAILED" }) {
  const map = {
    SUCCESS: "bg-success/15 text-success border-success/30",
    PENDING: "bg-warning/15 text-warning border-warning/30",
    FAILED: "bg-destructive/15 text-destructive border-destructive/30",
  } as const;
  const label = { SUCCESS: "Success", PENDING: "Pending sync", FAILED: "Failed" }[status];
  return (
    <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide", map[status])}>
      {label}
    </span>
  );
}

export function ActionTile({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}

export function Keypad({
  onDigit,
  onBackspace,
  extra,
}: {
  onDigit: (d: string) => void;
  onBackspace: () => void;
  extra?: { label: string; onPress: () => void };
}) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return (
    <div className="grid grid-cols-3 gap-3">
      {keys.map((k) => (
        <KeypadKey key={k} onPress={() => onDigit(k)}>
          {k}
        </KeypadKey>
      ))}
      <KeypadKey onPress={extra ? extra.onPress : () => onDigit(".")}>{extra ? extra.label : "."}</KeypadKey>
      <KeypadKey onPress={() => onDigit("0")}>0</KeypadKey>
      <KeypadKey onPress={onBackspace}>⌫</KeypadKey>
    </div>
  );
}

function KeypadKey({ children, onPress }: { children: ReactNode; onPress: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="rounded-2xl border border-border bg-card py-4 text-xl font-semibold text-foreground transition-transform active:scale-95 hover:bg-accent"
    >
      {children}
    </button>
  );
}

export function ScreenHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-5 py-4">
      <button
        onClick={onBack}
        className="flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-accent"
        aria-label="Go back home"
      >
        <span aria-hidden="true" className="text-lg leading-none">←</span>
      </button>
      <img src="/jertine-tech-logo.svg" alt="Jertine Tech Paymerch" className="size-8 rounded-xl object-contain" />
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
    </div>
  );
}
