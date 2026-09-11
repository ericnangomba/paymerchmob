import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatZar, usePaymerch } from "@/lib/paymerch-store";
import { Keypad, ScreenHeader } from "./ui";

export function PayMode({ onBack }: { onBack: () => void }) {
  const { buyerBalance, activeQr, generateQr, clearQr } = usePaymerch();
  const [raw, setRaw] = useState("");
  const [left, setLeft] = useState(60);

  const amount = Number(raw || "0") / 100;

  useEffect(() => {
    if (!activeQr) return;
    setLeft(60);
    const id = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          clearInterval(id);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [activeQr]);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Pay mode" onBack={onBack} />
      <div className="flex flex-1 flex-col justify-between px-5 py-5">
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Amount to pay</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-foreground">{formatZar(amount)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Buyer wallet · {formatZar(buyerBalance)} available</p>
        </div>

        <Keypad
          onDigit={(d) => /\d/.test(d) && setRaw((r) => (r + d).slice(0, 7))}
          onBackspace={() => setRaw((r) => r.slice(0, -1))}
          extra={{ label: "C", onPress: () => setRaw("") }}
        />

        <button
          disabled={amount <= 0}
          onClick={() => generateQr(amount)}
          className="rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground disabled:opacity-40"
        >
          Generate Payment QR
        </button>
      </div>

      {activeQr && (
        <div className="absolute inset-0 z-20 flex items-end bg-foreground/60 backdrop-blur-sm">
          <div className="w-full rounded-t-3xl bg-card p-6 text-center shadow-panel">
            <p className="text-sm font-semibold text-foreground">Show this to the merchant</p>
            <p className="text-xs text-muted-foreground">Single-use token · {activeQr.txn_token}</p>
            <div className="mx-auto mt-4 w-fit rounded-2xl border border-border bg-background p-3">
              <QRCodeSVG value={JSON.stringify(activeQr)} size={190} level="M" />
            </div>
            <p className="mt-4 text-2xl font-bold text-foreground">{formatZar(activeQr.amt)}</p>
            <p className={`text-sm font-semibold ${left > 10 ? "text-muted-foreground" : "text-destructive"}`}>
              {left > 0 ? `Expires in ${left}s` : "Token expired"}
            </p>
            <button
              onClick={() => {
                clearQr();
                setRaw("");
              }}
              className="mt-5 w-full rounded-2xl border border-border py-3 text-sm font-semibold text-foreground hover:bg-accent"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
