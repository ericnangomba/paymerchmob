import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatZar, usePaymerch } from "@/lib/paymerch-store";
import { Keypad, MainButton, ScreenHeader } from "./ui";

export function PayMode({ onBack, onHome }: { onBack: () => void; onHome?: () => void }) {
  const { buyerBalance, activeQr, generateQr, clearQr } = usePaymerch();
  const [raw, setRaw] = useState("");
  const [left, setLeft] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = Number(raw || "0") / 100;

  useEffect(() => {
    if (!activeQr) return;
    const updateExpiry = () => setLeft(Math.max(0, activeQr.exp - Math.floor(Date.now() / 1000)));
    updateExpiry();
    const id = setInterval(() => {
      updateExpiry();
    }, 1000);
    return () => clearInterval(id);
  }, [activeQr?.exp]);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Pay mode" onBack={onBack} />
      <div className="flex flex-1 flex-col justify-between px-5 py-5">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase text-warning">Mock bank · test funds only</p>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Amount to pay</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-foreground">
            {formatZar(amount)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Buyer wallet · {formatZar(buyerBalance)} available
          </p>
        </div>

        <Keypad
          onDigit={(d) => /\d/.test(d) && setRaw((r) => (r + d).slice(0, 7))}
          onBackspace={() => setRaw((r) => r.slice(0, -1))}
          extra={{ label: "C", onPress: () => setRaw("") }}
        />

        <button
          disabled={amount <= 0 || isGenerating}
          onClick={async () => {
            setIsGenerating(true);
            setError(null);
            try {
              await generateQr(amount);
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : "Could not create payment request");
            } finally {
              setIsGenerating(false);
            }
          }}
          className="rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground disabled:opacity-40"
        >
          {isGenerating ? "Creating secure QR…" : "Generate Payment QR"}
        </button>
        {error && <p className="text-center text-sm text-destructive" role="alert">{error}</p>}
      </div>

      {activeQr && (
        <div className="absolute inset-0 z-20 flex items-end bg-foreground/60 backdrop-blur-sm">
          <div className="w-full rounded-t-3xl bg-card p-6 text-center shadow-panel">
            <p className="text-sm font-semibold text-foreground">Show this to the merchant</p>
            <p className="text-xs text-muted-foreground">Demo payment request · valid for 2 minutes</p>
            <div className="mx-auto mt-4 w-fit rounded-2xl border border-border bg-background p-3">
              <QRCodeSVG value={JSON.stringify(activeQr)} size={190} level="M" />
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">{formatZar(activeQr.amt)}</p>
            <p
              className={`text-sm font-semibold ${left > 10 ? "text-muted-foreground" : "text-destructive"}`}
            >
              {left > 0 ? `Expires in ${left}s` : "Token expired"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Local mock approval only. No real money moves.</p>
            <button
              onClick={() => {
                clearQr();
                setRaw("");
              }}
              className="mt-5 w-full rounded-2xl border border-border py-3 text-sm font-semibold text-foreground hover:bg-accent"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onHome ?? onBack}
              className="mt-3 w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              Main screen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
