import { useCallback, useState } from "react";
import { PaymerchProvider, usePaymerch } from "@/lib/paymerch-store";
import { AuthScreen } from "./AuthScreen";
import { RegisterScreen } from "./RegisterScreen";
import { Dashboard } from "./Dashboard";
import { PayMode } from "./PayMode";
import { Scanner } from "./Scanner";
import { VasScreen } from "./VasScreen";
import { CashOut } from "./CashOut";
import { SplashScreen } from "./SplashScreen";
import type { Screen } from "./types";

export function PaymerchApp() {
  return (
    <PaymerchProvider>
      <div className="min-h-screen bg-secondary px-4 py-8">
        <div className="mx-auto w-full max-w-sm">
          <Shell />
        </div>
      </div>
    </PaymerchProvider>
  );
}

function Shell() {
  const { profile } = usePaymerch();
  const [showSplash, setShowSplash] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const finishSplash = useCallback(() => setShowSplash(false), []);

  return (
    <>
      <div className="relative h-[720px] overflow-hidden rounded-[2.25rem] border border-border bg-background shadow-panel">
        {showSplash ? (
          <SplashScreen onComplete={finishSplash} />
        ) : !profile ? (
          <RegisterScreen onDone={() => {}} />
        ) : !unlocked ? (
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
