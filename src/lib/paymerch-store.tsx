import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type TxnType = "MERCHANT_PAY" | "VAS_ELEC" | "VAS_AIRTIME" | "TOPUP" | "CASHOUT" | "BANK_DEPOSIT";
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

export type AccountKind = "business" | "individual";

export const BUSINESS_TYPES = [
  "Spaza shop",
  "Street vendor",
  "Car wash",
  "Taxi driver",
  "Tshisa nyama / braai",
  "Street food stall",
  "Fruit & veg seller",
  "Other informal trade",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export type BankAccount = {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  branchCode: string;
  accountType: "Savings" | "Cheque" | "Wallet" | "Business";
  isConfirmed: boolean;
};

export type Profile = {
  kind: AccountKind;
  name: string;
  phone: string;
  businessType?: BusinessType | undefined;
  bankAccount?: BankAccount | undefined;
};

export const PAYMERCH_BANK_ACCOUNT = {
  bankName: "Paymerch Commercial Bank",
  accountName: "Paymerch Wallet Settlement",
  accountNumber: "PMW-000240",
  branchCode: "001",
  accountType: "Wallet" as const,
};

function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hashPin(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + pin);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateChallenge(): BufferSource {
  const view = new Uint8Array(new ArrayBuffer(32)) as Uint8Array<ArrayBuffer>;
  return crypto.getRandomValues(view);
}

const loadFromStorage = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const saveToStorage = (key: string, value: unknown): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

const removeFromStorage = (key: string): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

type Store = {
  profile: Profile | null;
  register: (p: Profile) => void;
  pinSet: boolean;
  lockout: { locked: boolean; until: number | null };
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
  bankToWallet: (amount: number) => { ok: boolean; reason?: string };
  syncPending: () => number;
  createPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<{ ok: boolean; locked: boolean }>;
  clearPin: () => void;
  webauthnSupported: boolean;
  credentialId: string | null;
  registerBiometric: () => Promise<{ ok: boolean; error?: string }>;
  authenticateBiometric: () => Promise<{ ok: boolean; error?: string }>;
  clearBiometric: () => void;
};

const Ctx = createContext<Store | null>(null);

export function PaymerchProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(() => loadFromStorage<Profile | null>("pm_profile"));
  const register = useCallback((p: Profile) => {
    setProfile(p);
    saveToStorage("pm_profile", p);
  }, []);
  const [pinVerifier, setPinVerifier] = useState<{ salt: string; hash: string } | null>(() =>
    loadFromStorage<{ salt: string; hash: string } | null>("pm_pin"),
  );
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [buyerBalance, setBuyerBalance] = useState(() => loadFromStorage<number>("pm_buyerBalance") ?? 1250);
  const [merchantBalance, setMerchantBalance] = useState(
    () => loadFromStorage<number>("pm_merchantBalance") ?? 4820.5,
  );
  const [online, setOnline] = useState(() => loadFromStorage<boolean>("pm_online") ?? true);
  const [activeQr, setActiveQr] = useState<QrPayload | null>(null);
  const [txns, setTxns] = useState<Txn[]>(() =>
    loadFromStorage<Txn[]>("pm_txns") ?? [
      { id: rand(8), label: "Sale · Walk-in buyer", amount: 45, type: "MERCHANT_PAY", status: "SUCCESS", createdAt: Date.now() - 3.6e6 },
      { id: rand(8), label: "Airtime · 082 445 1190", amount: 20, type: "VAS_AIRTIME", status: "SUCCESS", createdAt: Date.now() - 7.2e6 },
      { id: rand(8), label: "Sale · Taxi fare", amount: 15, type: "MERCHANT_PAY", status: "SUCCESS", createdAt: Date.now() - 1.1e7 },
    ],
  );

  useEffect(() => { saveToStorage("pm_profile", profile); }, [profile]);
  useEffect(() => { if (pinVerifier) saveToStorage("pm_pin", pinVerifier); else removeFromStorage("pm_pin"); }, [pinVerifier]);
  useEffect(() => { saveToStorage("pm_buyerBalance", buyerBalance); }, [buyerBalance]);
  useEffect(() => { saveToStorage("pm_merchantBalance", merchantBalance); }, [merchantBalance]);
  useEffect(() => { saveToStorage("pm_online", online); }, [online]);
  useEffect(() => { saveToStorage("pm_txns", txns); }, [txns]);

  const pinSet = pinVerifier !== null;

  const createPin = useCallback(async (pin: string): Promise<void> => {
    const salt = generateSalt();
    const hash = await hashPin(pin, salt);
    setPinVerifier({ salt, hash });
  }, []);

  const clearPin = useCallback(() => {
    setPinVerifier(null);
    setFailedAttempts(0);
    setLockedUntil(null);
  }, []);

  const verifyPin = useCallback(
    async (pin: string): Promise<{ ok: boolean; locked: boolean }> => {
      if (lockedUntil && Date.now() < lockedUntil) return { ok: false, locked: true };
      if (lockedUntil && Date.now() >= lockedUntil) {
        setLockedUntil(null);
        setFailedAttempts(0);
      }
      if (!pinVerifier) return { ok: false, locked: false };
      const hash = await hashPin(pin, pinVerifier.salt);
      if (hash === pinVerifier.hash) {
        setFailedAttempts(0);
        return { ok: true, locked: false };
      }
      const next = failedAttempts + 1;
      setFailedAttempts(next);
      if (next >= 5) {
        const until = Date.now() + 5 * 60 * 1000;
        setLockedUntil(until);
        return { ok: false, locked: true };
      }
      return { ok: false, locked: false };
    },
    [pinVerifier, lockedUntil, failedAttempts],
  );

  const webauthnSupported =
    typeof window !== "undefined" &&
    "credentials" in navigator &&
    !!navigator.credentials?.create &&
    !!navigator.credentials?.get;

  const [credentialId, setCredentialId] = useState<string | null>(() =>
    loadFromStorage<string | null>("pm_credentialId"),
  );

  useEffect(() => {
    if (credentialId) saveToStorage("pm_credentialId", credentialId);
    else removeFromStorage("pm_credentialId");
  }, [credentialId]);

  const registerBiometric = useCallback(
    async (): Promise<{ ok: boolean; error?: string }> => {
      if (!webauthnSupported) return { ok: false, error: "Biometrics not supported in this browser" };
      if (credentialId) return { ok: false, error: "Biometric already registered" };
      if (typeof window === "undefined" || !navigator.credentials?.create) {
        return { ok: false, error: "Biometrics not supported" };
      }
      try {
        const credential = (await navigator.credentials.create({
          publicKey: {
            challenge: generateChallenge(),
            rp: { id: window.location.hostname, name: "Paymerch" },
            user: {
              id: crypto.getRandomValues(new Uint8Array(new ArrayBuffer(16)) as Uint8Array<ArrayBuffer>),
              name: "paymerch-user",
              displayName: "Paymerch User",
            },
            pubKeyCredParams: [
              { type: "public-key", alg: -7 },
              { type: "public-key", alg: -8 },
            ],
            authenticatorSelection: { userVerification: "required", requireResidentKey: true },
            timeout: 60000,
            attestation: "none",
          },
        })) as PublicKeyCredential | null;
        const cred = credential as PublicKeyCredential | null;
        if (!cred?.response || !("rawId" in cred.response)) return { ok: false, error: "Credential creation failed" };
        setCredentialId(cred.id);
        return { ok: true };
      } catch (err: any) {
        if (err.name === "NotAllowedError") return { ok: false, error: "Biometric registration cancelled" };
        if (err.name === "SecurityError") return { ok: false, error: "Biometric registration blocked" };
        return { ok: false, error: err.message || "Biometric registration failed" };
      }
    },
    [webauthnSupported, credentialId],
  );

  const authenticateBiometric = useCallback(
    async (): Promise<{ ok: boolean; error?: string }> => {
      if (!webauthnSupported || !credentialId) return { ok: false, error: "Biometrics not available" };
      if (typeof window === "undefined" || !navigator.credentials?.get) {
        return { ok: false, error: "Biometrics not supported" };
      }
      try {
        const assertion = (await navigator.credentials.get({
          publicKey: {
            challenge: generateChallenge(),
            allowCredentials: [{ id: base64UrlToUint8Array(credentialId) as BufferSource, type: "public-key" }],
            userVerification: "required",
            timeout: 60000,
          },
        })) as PublicKeyCredential | null;
        if (!assertion?.response) return { ok: false, error: "Authentication failed" };
        return { ok: true };
      } catch (err: any) {
        if (err.name === "NotAllowedError") return { ok: false, error: "Biometric authentication cancelled" };
        if (err.name === "SecurityError") return { ok: false, error: "Biometric authentication blocked" };
        return { ok: false, error: err.message || "Biometric authentication failed" };
      }
    },
    [webauthnSupported, credentialId],
  );

  const clearBiometric = useCallback(() => {
    setCredentialId(null);
  }, []);

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
      if (!profile?.bankAccount?.isConfirmed) return { ok: false, reason: "Confirm your bank account before cashing out" };
      if (!online) return { ok: false, reason: "Cash out needs a live connection" };
      if (amount > merchantBalance) return { ok: false, reason: "Amount exceeds wallet balance" };
      setMerchantBalance((m) => m - amount);
      push({ id: rand(8), label: `Cash out · ${profile.bankAccount?.bankName ?? "Bank transfer"}`, amount, type: "CASHOUT", status: "SUCCESS", createdAt: Date.now() });
      return { ok: true };
    },
    [merchantBalance, online, profile, push],
  );

  const bankToWallet = useCallback(
    (amount: number) => {
      if (!profile?.bankAccount?.isConfirmed) return { ok: false, reason: "Confirm your bank account before loading the wallet" };
      if (!online) return { ok: false, reason: "Bank transfer needs a live connection" };
      if (amount <= 0) return { ok: false, reason: "Enter a valid bank transfer amount" };
      setMerchantBalance((m) => m + amount);
      push({ id: rand(8), label: `Bank deposit · ${profile.bankAccount?.bankName ?? "Paymerch bank"}`, amount, type: "BANK_DEPOSIT", status: "SUCCESS", createdAt: Date.now() });
      return { ok: true };
    },
    [online, profile, push],
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
      profile,
      register,
      pinSet,
      lockout: { locked: lockedUntil !== null && Date.now() < lockedUntil, until: lockedUntil },
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
      bankToWallet,
      syncPending,
      createPin,
      verifyPin,
      clearPin,
      webauthnSupported,
      credentialId,
      registerBiometric,
      authenticateBiometric,
      clearBiometric,
    }),
    [
      profile, register, pinSet, lockedUntil, buyerBalance, merchantBalance, online, txns, activeQr,
      generateQr, settleQr, sellVas, cashOut, bankToWallet, syncPending, createPin, verifyPin, clearPin,
      webauthnSupported, credentialId, registerBiometric, authenticateBiometric, clearBiometric,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePaymerch() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePaymerch must be used inside PaymerchProvider");
  return ctx;
}