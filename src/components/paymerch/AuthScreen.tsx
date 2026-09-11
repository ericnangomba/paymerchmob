import { useState } from "react";
import { Fingerprint } from "lucide-react";
import logo from "@/assets/paymerchlogo.png.asset.json";
import { Keypad } from "./ui";

const PIN = "1234";

export function AuthScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const submit = (value: string) => {
    if (value === PIN) {
      onUnlock();
    } else {
      setError("Incorrect PIN. Try 1234.");
      setTimeout(() => setPin(""), 250);
    }
  };

  const onDigit = (d: string) => {
    if (pin.length >= 4 || !/\d/.test(d)) return;
    const next = pin + d;
    setPin(next);
    setError("");
    if (next.length === 4) setTimeout(() => submit(next), 180);
  };

  return (
    <div className="flex h-full flex-col justify-between px-6 pb-8 pt-12">
      <div className="text-center">
        <img src={logo.url} alt="Paymerch — Simply Secure Payments" className="mx-auto h-24 w-auto object-contain" />
        <p className="mt-2 text-sm text-muted-foreground">Enter your 4-digit PIN to continue</p>
      </div>

      <div className="flex justify-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`size-3.5 rounded-full border transition-colors ${
              pin.length > i ? "border-foreground bg-foreground" : "border-border bg-transparent"
            }`}
          />
        ))}
      </div>
      <p className="h-5 text-center text-xs font-medium text-destructive">{error}</p>

      <div className="space-y-4">
        <Keypad onDigit={onDigit} onBackspace={() => setPin((p) => p.slice(0, -1))} />
        <button
          onClick={onUnlock}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Fingerprint className="size-4" /> Use biometrics
        </button>
      </div>
    </div>
  );
}
