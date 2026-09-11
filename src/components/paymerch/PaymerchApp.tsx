import { useState } from "react";
import { Wifi, WifiOff, Moon, Sun, Lock } from "lucide-react";
import { PaymerchProvider, usePaymerch } from "@/lib/paymerch-store";
import { AuthScreen } from "./AuthScreen";
import { Dashboard } from "./Dashboard";
import { PayMode } from "./PayMode";
import { Scanner } from "./Scanner";
import { VasScreen } from "./VasScreen";
import { CashOut } from "./CashOut";
import type { Screen } from "./types";

export function PaymerchApp() {
  const [dark, setDark] = useState(false);

  return (
    <PaymerchProvider>
      <div className={dark ? "dark" : ""}>
        <div className="min-h-screen bg-secondary px-4 py-8">
          <div className="mx-auto w-full max-w-sm">
            <Shell dark={dark} setDark={setDark} />
          </div>
        </div>
      </div>
    </PaymerchProvider>
  );
}

function Shell({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  const { online, setOnline } = usePaymerch();
  const [unlocked, setUnlocked] = useState(false);
  const [screen, setScreen] = useState<Screen>("dashboard");

  return (
    <>
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-2.5">
        <span className="text-xs font-semibold text-muted-foreground">Prototype controls</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnline(!online)}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent"
          >
            {online ? <Wifi className="size-3.5 text-success" /> : <WifiOff className="size-3.5 text-warning" />}
            {online ? "Online" : "Offline"}
          </button>
          <button
            onClick={() => setDark(!dark)}
            className="flex size-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-accent"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          </button>
          {unlocked && (
            <button
              onClick={() => {
                setUnlocked(false);
                setScreen("dashboard");
              }}
              className="flex size-8 items-center justify-center rounded-full border border-border text-foreground hover:bg-accent"
              aria-label="Lock app"
            >
              <Lock className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative h-[720px] overflow-hidden rounded-[2.25rem] border border-border bg-background shadow-panel">
        {!unlocked ? (
          <AuthScreen onUnlock={() => setUnlocked(true)} />
        ) : screen === "dashboard" ? (
          <Dashboard go={setScreen} />
        ) : screen === "scanner" ? (
          <Scanner onBack={() => setScreen("dashboard")} />
        ) : screen === "pay" ? (
          <PayMode onBack={() => setScreen("dashboard")} />
        ) : screen === "vas" ? (
          <VasScreen onBack={() => setScreen("dashboard")} />
        ) : (
          <CashOut onBack={() => setScreen("dashboard")} />
        )}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Demo PIN <span className="font-semibold text-foreground">1234</span> · balances are simulated
      </p>
    </>
  );
}
