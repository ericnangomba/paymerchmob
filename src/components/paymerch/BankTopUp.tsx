import { useState } from "react";
import { Landmark, ArrowDownToLine } from "lucide-react";
import { formatZar, usePaymerch } from "@/lib/paymerch-store";
import { Keypad, ScreenHeader } from "./ui";

export function BankTopUp({ onBack }: { onBack: () => void }) {
  const { merchantBalance, bankToWallet, profile } = usePaymerch();
  const [raw, setRaw] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const amount = Number(raw || "0") / 100;

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Bank top-up" onBack={onBack} />
      <div className="flex flex-1 flex-col justify-between px-5 py-5">
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Landmark className="size-7" />
          </div>
          <p className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
            Bank to wallet
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-foreground">
            {formatZar(amount)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {profile?.bankAccount?.isConfirmed
              ? "Confirmed bank account"
              : "No confirmed bank account"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Wallet {formatZar(merchantBalance)} ·{" "}
            {profile?.bankAccount?.bankName ?? "Paymerch Bank"}
          </p>
          {msg && (
            <p
              className={`mt-3 text-sm font-semibold ${msg.ok ? "text-success" : "text-destructive"}`}
            >
              {msg.text}
            </p>
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
            const res = bankToWallet(amount);
            setMsg(
              res.ok
                ? { ok: true, text: "Bank transfer loaded to wallet" }
                : { ok: false, text: res.reason! },
            );
            if (res.ok) setRaw("");
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-deep py-4 text-base font-semibold text-primary-foreground disabled:opacity-40"
        >
          <ArrowDownToLine className="size-4" /> Deposit from bank
        </button>
      </div>
    </div>
  );
}
