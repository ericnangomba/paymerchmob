import { useState } from "react";
import { ScanLine, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatZar, usePaymerch, type QrPayload } from "@/lib/paymerch-store";
import { ScreenHeader } from "./ui";

export function Scanner({ onBack }: { onBack: () => void }) {
  const { activeQr, generateQr, settleQr, online } = usePaymerch();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [payload, setPayload] = useState<QrPayload | null>(null);

  const simulateScan = () => {
    const scanned = activeQr ?? generateQr(35);
    setPayload(scanned);
    const res = settleQr(scanned);
    setResult(
      res.ok
        ? {
            ok: true,
            text: online
              ? `Payment of ${formatZar(scanned.amt)} received`
              : `${formatZar(scanned.amt)} cached offline — will sync when back online`,
          }
        : { ok: false, text: res.reason ?? "Transaction declined" },
    );
  };

  return (
    <div className="flex h-full flex-col bg-foreground">
      <div className="bg-background">
        <ScreenHeader title="Scan Dynamic QR" onBack={onBack} />
      </div>
      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <div className="relative size-60 rounded-3xl border-2 border-dashed border-background/40">
          <span className="absolute inset-x-6 top-1/2 h-0.5 animate-pulse bg-brand" />
          <ScanLine className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 text-background/50" />
        </div>
        <p className="text-center text-xs text-background/70">
          Point the camera at the buyer's QR. This prototype simulates the camera stream.
        </p>
        <button
          onClick={simulateScan}
          className="rounded-2xl bg-background px-6 py-3.5 text-sm font-semibold text-foreground"
        >
          Simulate scan
        </button>

        {result && (
          <div className="w-full rounded-2xl bg-card p-5 text-left">
            <div className="flex items-center gap-2">
              {result.ok ? (
                <CheckCircle2 className="size-5 text-success" />
              ) : (
                <AlertTriangle className="size-5 text-destructive" />
              )}
              <p className="text-sm font-semibold text-foreground">{result.text}</p>
            </div>
            {payload && (
              <pre className="mt-3 overflow-x-auto rounded-xl bg-secondary p-3 text-[10px] leading-relaxed text-muted-foreground">
                {JSON.stringify(payload, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
