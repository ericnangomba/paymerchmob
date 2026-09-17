import { useCallback, useEffect, useState } from "react";
import { Fingerprint } from "lucide-react";
import { Keypad, MainButton } from "./ui";
import { usePaymerch } from "@/lib/paymerch-store";
import type { Screen } from "./types";

export function AuthScreen({ onUnlock, goHome }: { onUnlock: () => void; goHome: () => void }) {
  const { verifyPin, lockout, webauthnSupported, credentialId, authenticateBiometric } =
    usePaymerch();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [bioError, setBioError] = useState("");
  const [bioVerifying, setBioVerifying] = useState(false);
  const [lockRemaining, setLockRemaining] = useState(0);

  const isLocked = lockout.until !== null && lockRemaining > 0;
  const hasCredential = webauthnSupported && credentialId !== null;

  useEffect(() => {
    if (!lockout.until) return;
    const until = lockout.until;
    const update = () => {
      const remaining = Math.max(0, until - Date.now());
      setLockRemaining(remaining);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [lockout]);

  const submit = useCallback(
    async (value: string) => {
      setVerifying(true);
      const result = await verifyPin(value);
      setVerifying(false);
      if (result.ok) {
        onUnlock();
      } else if (result.locked) {
        setError("Too many attempts. Try again later.");
        setPin("");
      } else {
        setError("Incorrect PIN.");
        setPin("");
      }
    },
    [verifyPin, onUnlock],
  );

  const onDigit = (d: string) => {
    if (pin.length >= 4 || !/\d/.test(d)) return;
    const next = pin + d;
    setPin(next);
    setError("");
    if (next.length === 4) setTimeout(() => submit(next), 180);
  };

  const onBiometric = useCallback(async () => {
    setBioVerifying(true);
    setBioError("");
    const result = await authenticateBiometric();
    setBioVerifying(false);
    if (result.ok) {
      onUnlock();
    } else {
      setBioError(result.error || "Biometric authentication failed");
    }
  }, [authenticateBiometric, onUnlock]);

  if (isLocked) {
    const mins = Math.ceil(lockRemaining / 60000) || 1;
    return (
      <div className="flex h-full flex-col justify-center px-6 pb-8 pt-12">
        <div className="text-center">
          <img
            src="/mlogopaymerch.png"
            alt="Paymerch — Simply Secure Payments"
            className="mx-auto h-48 w-auto object-contain"
          />
          <p className="mt-4 text-sm font-semibold text-destructive">Account locked</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Too many failed attempts. Try again in {mins} min.
          </p>
        </div>
        <MainButton onClick={goHome} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between px-6 pb-8 pt-12">
      <div className="text-center">
        <img
          src="/mlogopaymerch.png"
          alt="Paymerch — Simply Secure Payments"
          className="mx-auto h-48 w-auto object-contain"
        />
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
          Mobile
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Your business. Your money. Even offline.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Enter your 4-digit PIN to continue</p>
      </div>
      <div className="flex justify-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`size-3.5 rounded-full border transition-colors ${pin.length > i ? "border-foreground bg-foreground" : "border-border bg-transparent"}`}
          />
        ))}
      </div>
      <p className="h-5 text-center text-xs font-medium text-destructive">{error}</p>
      <div className="space-y-4">
        <Keypad onDigit={onDigit} onBackspace={() => setPin((p) => p.slice(0, -1))} />
        <button
          onClick={() => submit(pin)}
          disabled={pin.length !== 4 || verifying}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {verifying ? "Verifying…" : "Unlock"}
        </button>
        {hasCredential && (
          <button
            onClick={onBiometric}
            disabled={bioVerifying}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3.5 text-sm font-semibold text-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Fingerprint className="size-4" />
            {bioVerifying ? "Verifying…" : "Use biometrics"}
          </button>
        )}
      </div>
      {bioError && <p className="text-center text-xs font-medium text-destructive">{bioError}</p>}
    </div>
  );
}
