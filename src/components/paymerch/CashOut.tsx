import { useState } from "react";
import { formatZar, usePaymerch } from "@/lib/paymerch-store";
import { Keypad, ScreenHeader } from "./ui";

export function CashOut({ onBack }: { onBack: () => void }) {
  const { merchantBalance, cashOut } = usePaymerch();
  const [raw, setRaw] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const amount = Number(raw || "0") / 100;

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Cash out" onBack={onBack} />
      <div className="flex flex-1 flex-col justify-between px-5 py-5">
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Amount to withdraw</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-foreground">{formatZar(amount)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Available {formatZar(merchantBalance)}</p>
          {msg && (
            <p className={`mt-3 text-sm font-semibold ${msg.ok ? "text-success" : "text-destructive"}`}>{msg.text}</p>
          )}
        </div>

        <Keypad
          onDigit={(d) => /\d/.test(d) && setRaw((r) => (r + d).slice(0, 7))}
          onBackspace={() => setRaw((r) => r.slice(0, -1))}
          extra={{ label: "C", onPress: () => setRaw("") }}
        />

        <button
          disabled={amount <= 0}
          onClick={() => {
            const res = cashOut(amount);
            setMsg(res.ok ? { ok: true, text: "Transfer sent to your bank" } : { ok: false, text: res.reason! });
            if (res.ok) setRaw("");
          }}
          className="rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground disabled:opacity-40"
        >
          Withdraw to bank
        </button>
      </div>
    </div>
  );
}
