import { useState } from "react";
import { Eye, EyeOff, QrCode, Zap, Banknote, RefreshCw } from "lucide-react";
import icon from "@/assets/icon_paymerch.png.asset.json";
import { formatZar, usePaymerch } from "@/lib/paymerch-store";
import { ActionTile, StatusBadge } from "./ui";
import type { Screen } from "./types";

export function Dashboard({ go }: { go: (s: Screen) => void }) {
  const { merchantBalance, online, setOnline, txns, pendingCount, syncPending } = usePaymerch();
  const [visible, setVisible] = useState(true);

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={icon.url} alt="" className="size-9" />
            <div>
              <p className="text-sm font-semibold text-foreground">My business</p>
              <button
                onClick={() => setOnline(!online)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <span className={`size-2 rounded-full ${online ? "bg-success" : "bg-warning"}`} />
                {online ? "Online" : "Offline mode"}
              </button>
            </div>
          </div>
          <button
            onClick={() => setVisible((v) => !v)}
            className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent"
            aria-label="Toggle balance visibility"
          >
            {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </button>
        </div>

        <div className="mt-4 rounded-2xl bg-primary p-5 text-primary-foreground">
          <p className="text-xs opacity-70">Wallet balance</p>
          <p className="mt-1 text-3xl font-bold tracking-tight">{visible ? formatZar(merchantBalance) : "R ••••••"}</p>
          {pendingCount > 0 && (
            <button
              onClick={() => syncPending()}
              disabled={!online}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warning px-3 py-1 text-[11px] font-semibold text-warning-foreground disabled:opacity-60"
            >
              <RefreshCw className="size-3" />
              {pendingCount} offline txn{pendingCount > 1 ? "s" : ""} — {online ? "sync now" : "waiting for network"}
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        <button
          onClick={() => go("scanner")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-deep py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <QrCode className="size-5" /> Scan Dynamic QR
        </button>

        <div className="grid gap-3">
          <ActionTile
            icon={<Zap className="size-4" />}
            title="Sell VAS"
            subtitle="Airtime & prepaid electricity"
            onClick={() => go("vas")}
          />
          <ActionTile
            icon={<Banknote className="size-4" />}
            title="Cash out"
            subtitle="Move wallet funds to your bank"
            onClick={() => go("cashout")}
          />
          <ActionTile
            icon={<QrCode className="size-4" />}
            title="Buyer pay mode"
            subtitle="Generate a payment QR to pay someone"
            onClick={() => go("pay")}
          />
        </div>

        <div className="pt-2">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent activity</h3>
          <ul className="space-y-2">
            {txns.slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(t.createdAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                    {t.token ? ` · token ${t.token}` : ""}
                  </p>
                </div>
                <div className="ml-3 shrink-0 text-right">
                  <p className="text-sm font-semibold text-foreground">{formatZar(t.amount)}</p>
                  <StatusBadge status={t.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
