import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type TxnType = "MERCHANT_PAY" | "VAS_ELEC" | "VAS_AIRTIME" | "TOPUP" | "CASHOUT";
export type TxnStatus = "SUCCESS" | "PENDING" | "FAILED";

export type Txn = {
  id: string;
  label: string;
  amount: number;
  type: TxnType;
  status: TxnStatus;
  createdAt: number;
  token?: string | undefined;
};

export type QrPayload = {
  ver: string;
  txn_token: string;
  buyer_wallet: string;
  amt: number;
  cur: "ZAR";
  exp: number;
  sig: string;
};

const rand = (n: number) =>
  Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

export const formatZar = (v: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(v);

type Store = {
  buyerBalance: number;
  merchantBalance: number;
  online: boolean;
  setOnline: (v: boolean) => void;
  txns: Txn[];
  pendingCount: number;
  activeQr: QrPayload | null;
  generateQr: (amount: number) => QrPayload;
  clearQr: () => void;
  settleQr: (payload: QrPayload) => { ok: boolean; reason?: string; txn?: Txn };
  sellVas: (kind: "VAS_ELEC" | "VAS_AIRTIME", target: string, amount: number) => Txn;
  cashOut: (amount: number) => { ok: boolean; reason?: string };
  syncPending: () => number;
};

const Ctx = createContext<Store | null>(null);

export function PaymerchProvider({ children }: { children: ReactNode }) {
  const [buyerBalance, setBuyerBalance] = useState(1250);
  const [merchantBalance, setMerchantBalance] = useState(4820.5);
  const [online, setOnline] = useState(true);
  const [activeQr, setActiveQr] = useState<QrPayload | null>(null);
  const [txns, setTxns] = useState<Txn[]>([
    { id: rand(8), label: "Sale · Walk-in buyer", amount: 45, type: "MERCHANT_PAY", status: "SUCCESS", createdAt: Date.now() - 3.6e6 },
    { id: rand(8), label: "Airtime · 082 445 1190", amount: 20, type: "VAS_AIRTIME", status: "SUCCESS", createdAt: Date.now() - 7.2e6 },
    { id: rand(8), label: "Sale · Taxi fare", amount: 15, type: "MERCHANT_PAY", status: "SUCCESS", createdAt: Date.now() - 1.1e7 },
  ]);

  const push = useCallback((t: Txn) => setTxns((prev) => [t, ...prev]), []);

  const generateQr = useCallback((amount: number) => {
    const payload: QrPayload = {
      ver: "1.0",
      txn_token: `tok_${rand(8)}_pm`,
      buyer_wallet: "wlt_buyer_4410",
      amt: amount,
      cur: "ZAR",
      exp: Math.floor(Date.now() / 1000) + 60,
      sig: rand(64),
    };
    setActiveQr(payload);
    return payload;
  }, []);

  const settleQr = useCallback(
    (payload: QrPayload) => {
      if (Math.floor(Date.now() / 1000) > payload.exp) return { ok: false, reason: "Token expired (60s)" };
      if (payload.amt > buyerBalance) return { ok: false, reason: "Buyer has insufficient funds" };
      const txn: Txn = {
        id: rand(8),
        label: online ? "Sale · Dynamic QR" : "Sale · Offline pending sync",
        amount: payload.amt,
        type: "MERCHANT_PAY",
        status: online ? "SUCCESS" : "PENDING",
        createdAt: Date.now(),
      };
      setBuyerBalance((b) => b - payload.amt);
      if (online) setMerchantBalance((m) => m + payload.amt);
      push(txn);
      setActiveQr(null);
      return { ok: true, txn };
    },
    [buyerBalance, online, push],
  );

  const sellVas = useCallback(
    (kind: "VAS_ELEC" | "VAS_AIRTIME", target: string, amount: number) => {
      const token = kind === "VAS_ELEC" ? Array.from({ length: 20 }, () => Math.floor(Math.random() * 10)).join("") : undefined;
      const txn: Txn = {
        id: rand(8),
        label: `${kind === "VAS_ELEC" ? "Electricity" : "Airtime"} · ${target}`,
        amount,
        type: kind,
        status: online ? "SUCCESS" : "PENDING",
        createdAt: Date.now(),
        token,
      };
      if (online) setMerchantBalance((m) => m + amount);
      push(txn);
      return txn;
    },
    [online, push],
  );

  const cashOut = useCallback(
    (amount: number) => {
      if (!online) return { ok: false, reason: "Cash out needs a live connection" };
      if (amount > merchantBalance) return { ok: false, reason: "Amount exceeds wallet balance" };
      setMerchantBalance((m) => m - amount);
      push({ id: rand(8), label: "Cash out · Bank transfer", amount, type: "CASHOUT", status: "SUCCESS", createdAt: Date.now() });
      return { ok: true };
    },
    [merchantBalance, online, push],
  );

  const syncPending = useCallback(() => {
    let synced = 0;
    setTxns((prev) =>
      prev.map((t) => {
        if (t.status !== "PENDING") return t;
        synced += 1;
        setMerchantBalance((m) => m + t.amount);
        return { ...t, status: "SUCCESS" as const, label: t.label.replace(" · Offline pending sync", " · Dynamic QR") };
      }),
    );
    return synced;
  }, []);

  const value = useMemo<Store>(
    () => ({
      buyerBalance,
      merchantBalance,
      online,
      setOnline,
      txns,
      pendingCount: txns.filter((t) => t.status === "PENDING").length,
      activeQr,
      generateQr,
      clearQr: () => setActiveQr(null),
      settleQr,
      sellVas,
      cashOut,
      syncPending,
    }),
    [buyerBalance, merchantBalance, online, txns, activeQr, generateQr, settleQr, sellVas, cashOut, syncPending],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePaymerch() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePaymerch must be used inside PaymerchProvider");
  return ctx;
}
