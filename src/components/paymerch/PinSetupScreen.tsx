import { useCallback, useState } from "react";
import { Keypad, MainButton } from "./ui";
import { usePaymerch } from "@/lib/paymerch-store";

export function PinSetupScreen({ onDone, goHome }: { onDone: () => void; goHome: () => void }) {
  const { createPin, registerBiometric, webauthnSupported, credentialId } = usePaymerch();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const onDigit = (d: string) => {
    if (pin.length >= 4 || !/\d/.test(d)) return;
    const next = pin + d;
    setPin(next);
    setError("");
  };

  const onConfirmDigit = (d: string) => {
    if (confirm.length >= 4 || !/\d/.test(d)) return;
    const next = confirm + d;
    setConfirm(next);
    setError("");
  };

  const submit = useCallback(async () => {
    if (pin.length !== 4 || confirm.length !== 4) return;
    if (pin !== confirm) {
      setError("PINs do not match.");
      setPin("");
      setConfirm("");
      return;
    }
    await createPin(pin);
    if (webauthnSupported && !credentialId) {
      registerBiometric().catch(() => {
        /* non-blocking: user can register biometric later */
      });
    }
    setDone(true);
    setTimeout(() => onDone(), 400);
  }, [pin, confirm, createPin, webauthnSupported, credentialId, registerBiometric, onDone]);

  if (done) {
    return (
      <div className="flex h-full flex-col justify-center px-6 pb-8 pt-12">
        <div className="text-center">
          <p className="text-sm font-semibold text-success">PIN set</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Your PIN has been secured. Enter it to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between overflow-y-auto px-6 pb-8 pt-10">
      <div className="text-center">
        <img
          src="/mlogopaymerch.png"
          alt="Paymerch"
          className="mx-auto h-40 w-auto object-contain"
        />
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">
          Mobile
        </p>
        <h1 className="mt-4 text-xl font-bold text-foreground">Set your PIN</h1>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Choose a 4-digit PIN you will use to unlock the app.
        </p>
      </div>

      <div className="mt-4">
        <span className="text-xs font-semibold text-muted-foreground">Create PIN</span>
        <div className="mt-1 flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`size-3.5 rounded-full border transition-colors ${pin.length > i ? "border-foreground bg-foreground" : "border-border bg-transparent"}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <span className="text-xs font-semibold text-muted-foreground">Confirm PIN</span>
        <div className="mt-1 flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`size-3.5 rounded-full border transition-colors ${confirm.length > i ? "border-foreground bg-foreground" : "border-border bg-transparent"}`}
            />
          ))}
        </div>
      </div>

      <p className="h-5 text-center text-xs font-medium text-destructive">{error}</p>

      <div className="space-y-4">
        <Keypad onDigit={onDigit} onBackspace={() => setPin((p) => p.slice(0, -1))} />
        <p className="text-center text-[11px] text-muted-foreground">
          Enter digits for Create PIN above
        </p>
        <Keypad onDigit={onConfirmDigit} onBackspace={() => setConfirm((p) => p.slice(0, -1))} />
        <p className="text-center text-[11px] text-muted-foreground">
          Enter digits for Confirm PIN above
        </p>
        <button
          onClick={submit}
          disabled={pin.length !== 4 || confirm.length !== 4}
          className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Confirm PIN
        </button>
      </div>
      <MainButton onClick={goHome} />
    </div>
  );
}
