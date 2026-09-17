import { useCallback, useState } from "react";
import { PaymerchProvider, usePaymerch } from "@/lib/paymerch-store";
import { AuthScreen } from "./AuthScreen";
import { PinSetupScreen } from "./PinSetupScreen";
import { RegisterScreen } from "./RegisterScreen";
import { Dashboard } from "./Dashboard";
import { PayMode } from "./PayMode";
import { Scanner } from "./Scanner";
import { VasScreen } from "./VasScreen";
import { CashOut } from "./CashOut";
import { BankTopUp } from "./BankTopUp";
import { SplashScreen } from "./SplashScreen";
import { MainButton } from "./ui";
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
  const { profile, pinSet } = usePaymerch();
  const [showSplash, setShowSplash] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const finishSplash = useCallback(() => setShowSplash(false), []);
  const goHome = useCallback(() => setScreen("dashboard"), []);

  const showMainButton = !showSplash && profile && pinSet && unlocked && screen !== "dashboard";

  return (
    <>
      <div className="relative h-[720px] overflow-hidden rounded-[2.25rem] border border-border bg-background shadow-panel">
        {showSplash ? (
          <SplashScreen onComplete={finishSplash} />
        ) : !profile ? (
          <RegisterScreen onDone={() => {}} />
        ) : !pinSet ? (
          <PinSetupScreen onDone={() => {}} goHome={goHome} />
        ) : !unlocked ? (
          <AuthScreen onUnlock={() => setUnlocked(true)} goHome={goHome} />
        ) : screen === "dashboard" ? (
          <Dashboard go={setScreen} />
        ) : screen === "scanner" ? (
          <Scanner onBack={goHome} />
        ) : screen === "pay" ? (
          <PayMode onBack={goHome} onHome={goHome} />
        ) : screen === "vas" ? (
          <VasScreen onBack={goHome} />
        ) : screen === "cashout" ? (
          <CashOut onBack={goHome} />
        ) : (
          <BankTopUp onBack={goHome} />
        )}
        {showMainButton && <MainButton onClick={goHome} />}
      </div>
    </>
  );
}