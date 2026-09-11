import { useState } from "react";
import { Zap, Smartphone, Copy } from "lucide-react";
import { formatZar, usePaymerch, type Txn } from "@/lib/paymerch-store";
import { ScreenHeader } from "./ui";

const VALUES = [20, 50, 100, 200];

export function VasScreen({ onBack }: { onBack: () => void }) {
  const { sellVas } = usePaymerch();
  const [kind, setKind] = useState<"VAS_ELEC" | "VAS_AIRTIME">("VAS_ELEC");
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState(50);
  const [receipt, setReceipt] = useState<Txn | null>(null);

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Sell value-added services" onBack={onBack} />
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { k: "VAS_ELEC", label: "Electricity", icon: <Zap className="size-4" /> },
              { k: "VAS_AIRTIME", label: "Airtime", icon: <Smartphone className="size-4" /> },
            ] as const
          ).map((o) => (
            <button
              key={o.k}
              onClick={() => {
                setKind(o.k);
                setReceipt(null);
              }}
              className={`flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold transition-colors ${
                kind === o.k
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-accent"
              }`}
            >
              {o.icon}
              {o.label}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {kind === "VAS_ELEC" ? "Meter number" : "Phone number"}
          </span>
          <input
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            inputMode="numeric"
            placeholder={kind === "VAS_ELEC" ? "0412 3456 7890 1234" : "082 000 0000"}
            className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Value</span>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {VALUES.map((v) => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className={`rounded-xl border py-3 text-sm font-semibold transition-colors ${
                  amount === v
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-accent"
                }`}
              >
                R{v}
              </button>
            ))}
          </div>
        </div>

        <button
          disabled={target.trim().length < 4}
          onClick={() => setReceipt(sellVas(kind, target.trim(), amount))}
          className="w-full rounded-2xl bg-brand-deep py-4 text-base font-semibold text-primary-foreground disabled:opacity-40"
        >
          Vend {formatZar(amount)}
        </button>

        {receipt && (
          <div className="rounded-2xl border border-success/30 bg-success/10 p-5">
            <p className="text-sm font-semibold text-foreground">{receipt.label}</p>
            <p className="text-xs text-muted-foreground">
              {formatZar(receipt.amount)} · {receipt.status === "SUCCESS" ? "Vended" : "Queued offline"}
            </p>
            {receipt.token && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">STS token</p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="flex-1 rounded-xl bg-card px-3 py-2 text-sm tracking-widest text-foreground">
                    {receipt.token.replace(/(\d{4})(?=\d)/g, "$1 ")}
                  </code>
                  <button
                    onClick={() => navigator.clipboard?.writeText(receipt.token!)}
                    className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-accent"
                    aria-label="Copy token"
                  >
                    <Copy className="size-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
