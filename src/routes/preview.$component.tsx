import { createFileRoute } from "@tanstack/react-router";
import type { ComponentType } from "react";

import { PaymerchProvider } from "@/lib/paymerch-store";
import { AuthScreen } from "@/components/paymerch/AuthScreen";
import { RegisterScreen } from "@/components/paymerch/RegisterScreen";
import { Dashboard } from "@/components/paymerch/Dashboard";
import { PayMode } from "@/components/paymerch/PayMode";
import { Scanner } from "@/components/paymerch/Scanner";
import { VasScreen } from "@/components/paymerch/VasScreen";
import { CashOut } from "@/components/paymerch/CashOut";
import { BankTopUp } from "@/components/paymerch/BankTopUp";
import { SplashScreen } from "@/components/paymerch/SplashScreen";

type PreviewEntry = {
  component: ComponentType<any>;
  props?: Record<string, unknown>;
};

const previewMap: Record<string, PreviewEntry> = {
  AuthScreen: { component: AuthScreen, props: { onUnlock: () => undefined } },
  RegisterScreen: { component: RegisterScreen, props: { onDone: () => undefined } },
  Dashboard: { component: Dashboard, props: { go: () => undefined } },
  PayMode: { component: PayMode, props: { onBack: () => undefined } },
  Scanner: { component: Scanner, props: { onBack: () => undefined } },
  VasScreen: { component: VasScreen, props: { onBack: () => undefined } },
  CashOut: { component: CashOut, props: { onBack: () => undefined } },
  BankTopUp: { component: BankTopUp, props: { onBack: () => undefined } },
  SplashScreen: { component: SplashScreen, props: { onComplete: () => undefined } },
};

export const Route = createFileRoute("/preview/$component")({
  component: PreviewRoute,
});

function PreviewRoute() {
  const { component } = Route.useParams();
  const requested = decodeURIComponent(component || "");
  const entry = previewMap[requested] ?? previewMap[requested.replace(/\.tsx$/i, "")];

  if (!entry) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Preview not found</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Available previews: {Object.keys(previewMap).join(", ")}
          </p>
        </div>
      </div>
    );
  }

  const Component = entry.component;

  return (
    <PaymerchProvider>
      <div className="min-h-screen bg-secondary p-4">
        <div className="mx-auto w-full max-w-sm">
          <div className="relative h-[720px] overflow-hidden rounded-[2.25rem] border border-border bg-background shadow-panel">
            <Component {...(entry.props ?? {})} />
          </div>
        </div>
      </div>
    </PaymerchProvider>
  );
}
