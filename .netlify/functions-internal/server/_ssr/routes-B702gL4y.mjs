import { r as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as CircleCheck, a as Store, b as Banknote, c as RefreshCw, d as Landmark, f as House, g as Copy, h as EyeOff, i as TriangleAlert, l as QrCode, m as Eye, n as VideoOff, o as Smartphone, p as FingerprintPattern, r as User, s as ShieldCheck, t as Zap, u as LoaderCircle, v as Check, x as ArrowDownToLine, y as Camera } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { t as QRCodeSVG } from "../_libs/qrcode.react.mjs";
import { t as BrowserQRCodeReader } from "../_libs/@zxing/browser+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B702gL4y.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var rand = (n) => Array.from({ length: n }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
var formatZar = (v) => new Intl.NumberFormat("en-ZA", {
	style: "currency",
	currency: "ZAR"
}).format(v);
var BUSINESS_TYPES = [
	"Spaza shop",
	"Street vendor",
	"Car wash",
	"Taxi driver",
	"Tshisa nyama / braai",
	"Street food stall",
	"Fruit & veg seller",
	"Other informal trade"
];
function base64UrlToUint8Array(base64Url) {
	const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
	const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}
async function hashPin(pin, salt) {
	const data = new TextEncoder().encode(salt + pin);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function generateSalt() {
	const array = /* @__PURE__ */ new Uint8Array(16);
	crypto.getRandomValues(array);
	return Array.from(array).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function generateChallenge() {
	const view = new Uint8Array(/* @__PURE__ */ new ArrayBuffer(32));
	return crypto.getRandomValues(view);
}
var loadFromStorage = (key) => {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(key);
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
};
var saveToStorage = (key, value) => {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {}
};
var removeFromStorage = (key) => {
	if (typeof window === "undefined") return;
	try {
		localStorage.removeItem(key);
	} catch {}
};
var Ctx = (0, import_react.createContext)(null);
function PaymerchProvider({ children }) {
	const [profile, setProfile] = (0, import_react.useState)(() => loadFromStorage("pm_profile"));
	const register = (0, import_react.useCallback)((p) => {
		setProfile(p);
		saveToStorage("pm_profile", p);
	}, []);
	const [pinVerifier, setPinVerifier] = (0, import_react.useState)(() => loadFromStorage("pm_pin"));
	const [failedAttempts, setFailedAttempts] = (0, import_react.useState)(0);
	const [lockedUntil, setLockedUntil] = (0, import_react.useState)(null);
	const [buyerBalance, setBuyerBalance] = (0, import_react.useState)(() => loadFromStorage("pm_buyerBalance") ?? 1250);
	const [merchantBalance, setMerchantBalance] = (0, import_react.useState)(() => loadFromStorage("pm_merchantBalance") ?? 4820.5);
	const [online, setOnline] = (0, import_react.useState)(() => loadFromStorage("pm_online") ?? true);
	const [activeQr, setActiveQr] = (0, import_react.useState)(null);
	const [txns, setTxns] = (0, import_react.useState)(() => loadFromStorage("pm_txns") ?? [
		{
			id: rand(8),
			label: "Sale · Walk-in buyer",
			amount: 45,
			type: "MERCHANT_PAY",
			status: "SUCCESS",
			createdAt: Date.now() - 36e5
		},
		{
			id: rand(8),
			label: "Airtime · 082 445 1190",
			amount: 20,
			type: "VAS_AIRTIME",
			status: "SUCCESS",
			createdAt: Date.now() - 72e5
		},
		{
			id: rand(8),
			label: "Sale · Taxi fare",
			amount: 15,
			type: "MERCHANT_PAY",
			status: "SUCCESS",
			createdAt: Date.now() - 11e6
		}
	]);
	(0, import_react.useEffect)(() => {
		saveToStorage("pm_profile", profile);
	}, [profile]);
	(0, import_react.useEffect)(() => {
		if (pinVerifier) saveToStorage("pm_pin", pinVerifier);
		else removeFromStorage("pm_pin");
	}, [pinVerifier]);
	(0, import_react.useEffect)(() => {
		saveToStorage("pm_buyerBalance", buyerBalance);
	}, [buyerBalance]);
	(0, import_react.useEffect)(() => {
		saveToStorage("pm_merchantBalance", merchantBalance);
	}, [merchantBalance]);
	(0, import_react.useEffect)(() => {
		saveToStorage("pm_online", online);
	}, [online]);
	(0, import_react.useEffect)(() => {
		saveToStorage("pm_txns", txns);
	}, [txns]);
	const pinSet = pinVerifier !== null;
	const createPin = (0, import_react.useCallback)(async (pin) => {
		const salt = generateSalt();
		const hash = await hashPin(pin, salt);
		setPinVerifier({
			salt,
			hash
		});
	}, []);
	const clearPin = (0, import_react.useCallback)(() => {
		setPinVerifier(null);
		setFailedAttempts(0);
		setLockedUntil(null);
	}, []);
	const verifyPin = (0, import_react.useCallback)(async (pin) => {
		if (lockedUntil && Date.now() < lockedUntil) return {
			ok: false,
			locked: true
		};
		if (lockedUntil && Date.now() >= lockedUntil) {
			setLockedUntil(null);
			setFailedAttempts(0);
		}
		if (!pinVerifier) return {
			ok: false,
			locked: false
		};
		if (await hashPin(pin, pinVerifier.salt) === pinVerifier.hash) {
			setFailedAttempts(0);
			return {
				ok: true,
				locked: false
			};
		}
		const next = failedAttempts + 1;
		setFailedAttempts(next);
		if (next >= 5) {
			const until = Date.now() + 3e5;
			setLockedUntil(until);
			return {
				ok: false,
				locked: true
			};
		}
		return {
			ok: false,
			locked: false
		};
	}, [
		pinVerifier,
		lockedUntil,
		failedAttempts
	]);
	const webauthnSupported = typeof window !== "undefined" && "credentials" in navigator && !!navigator.credentials?.create && !!navigator.credentials?.get;
	const [credentialId, setCredentialId] = (0, import_react.useState)(() => loadFromStorage("pm_credentialId"));
	(0, import_react.useEffect)(() => {
		if (credentialId) saveToStorage("pm_credentialId", credentialId);
		else removeFromStorage("pm_credentialId");
	}, [credentialId]);
	const registerBiometric = (0, import_react.useCallback)(async () => {
		if (!webauthnSupported) return {
			ok: false,
			error: "Biometrics not supported in this browser"
		};
		if (credentialId) return {
			ok: false,
			error: "Biometric already registered"
		};
		if (typeof window === "undefined" || !navigator.credentials?.create) return {
			ok: false,
			error: "Biometrics not supported"
		};
		try {
			const cred = await navigator.credentials.create({ publicKey: {
				challenge: generateChallenge(),
				rp: {
					id: window.location.hostname,
					name: "Paymerch"
				},
				user: {
					id: crypto.getRandomValues(new Uint8Array(/* @__PURE__ */ new ArrayBuffer(16))),
					name: "paymerch-user",
					displayName: "Paymerch User"
				},
				pubKeyCredParams: [{
					type: "public-key",
					alg: -7
				}, {
					type: "public-key",
					alg: -8
				}],
				authenticatorSelection: {
					userVerification: "required",
					requireResidentKey: true
				},
				timeout: 6e4,
				attestation: "none"
			} });
			if (!cred?.response || !("rawId" in cred.response)) return {
				ok: false,
				error: "Credential creation failed"
			};
			setCredentialId(cred.id);
			return { ok: true };
		} catch (err) {
			if (err.name === "NotAllowedError") return {
				ok: false,
				error: "Biometric registration cancelled"
			};
			if (err.name === "SecurityError") return {
				ok: false,
				error: "Biometric registration blocked"
			};
			return {
				ok: false,
				error: err.message || "Biometric registration failed"
			};
		}
	}, [webauthnSupported, credentialId]);
	const authenticateBiometric = (0, import_react.useCallback)(async () => {
		if (!webauthnSupported || !credentialId) return {
			ok: false,
			error: "Biometrics not available"
		};
		if (typeof window === "undefined" || !navigator.credentials?.get) return {
			ok: false,
			error: "Biometrics not supported"
		};
		try {
			if (!(await navigator.credentials.get({ publicKey: {
				challenge: generateChallenge(),
				allowCredentials: [{
					id: base64UrlToUint8Array(credentialId),
					type: "public-key"
				}],
				userVerification: "required",
				timeout: 6e4
			} }))?.response) return {
				ok: false,
				error: "Authentication failed"
			};
			return { ok: true };
		} catch (err) {
			if (err.name === "NotAllowedError") return {
				ok: false,
				error: "Biometric authentication cancelled"
			};
			if (err.name === "SecurityError") return {
				ok: false,
				error: "Biometric authentication blocked"
			};
			return {
				ok: false,
				error: err.message || "Biometric authentication failed"
			};
		}
	}, [webauthnSupported, credentialId]);
	const clearBiometric = (0, import_react.useCallback)(() => {
		setCredentialId(null);
	}, []);
	const push = (0, import_react.useCallback)((t) => setTxns((prev) => [t, ...prev]), []);
	const generateQr = (0, import_react.useCallback)((amount) => {
		const payload = {
			ver: "1.0",
			txn_token: `tok_${rand(8)}_pm`,
			buyer_wallet: "wlt_buyer_4410",
			amt: amount,
			cur: "ZAR",
			exp: Math.floor(Date.now() / 1e3) + 60,
			sig: rand(64)
		};
		setActiveQr(payload);
		return payload;
	}, []);
	const settleQr = (0, import_react.useCallback)((payload) => {
		if (Math.floor(Date.now() / 1e3) > payload.exp) return {
			ok: false,
			reason: "Token expired (60s)"
		};
		if (payload.amt > buyerBalance) return {
			ok: false,
			reason: "Buyer has insufficient funds"
		};
		const txn = {
			id: rand(8),
			label: online ? "Sale · Dynamic QR" : "Sale · Offline pending sync",
			amount: payload.amt,
			type: "MERCHANT_PAY",
			status: online ? "SUCCESS" : "PENDING",
			createdAt: Date.now()
		};
		setBuyerBalance((b) => b - payload.amt);
		if (online) setMerchantBalance((m) => m + payload.amt);
		push(txn);
		setActiveQr(null);
		return {
			ok: true,
			txn
		};
	}, [
		buyerBalance,
		online,
		push
	]);
	const sellVas = (0, import_react.useCallback)((kind, target, amount) => {
		const token = kind === "VAS_ELEC" ? Array.from({ length: 20 }, () => Math.floor(Math.random() * 10)).join("") : void 0;
		const txn = {
			id: rand(8),
			label: `${kind === "VAS_ELEC" ? "Electricity" : "Airtime"} · ${target}`,
			amount,
			type: kind,
			status: online ? "SUCCESS" : "PENDING",
			createdAt: Date.now(),
			token
		};
		if (online) setMerchantBalance((m) => m + amount);
		push(txn);
		return txn;
	}, [online, push]);
	const cashOut = (0, import_react.useCallback)((amount) => {
		if (!profile?.bankAccount?.isConfirmed) return {
			ok: false,
			reason: "Confirm your bank account before cashing out"
		};
		if (!online) return {
			ok: false,
			reason: "Cash out needs a live connection"
		};
		if (amount > merchantBalance) return {
			ok: false,
			reason: "Amount exceeds wallet balance"
		};
		setMerchantBalance((m) => m - amount);
		push({
			id: rand(8),
			label: `Cash out · ${profile.bankAccount?.bankName ?? "Bank transfer"}`,
			amount,
			type: "CASHOUT",
			status: "SUCCESS",
			createdAt: Date.now()
		});
		return { ok: true };
	}, [
		merchantBalance,
		online,
		profile,
		push
	]);
	const bankToWallet = (0, import_react.useCallback)((amount) => {
		if (!profile?.bankAccount?.isConfirmed) return {
			ok: false,
			reason: "Confirm your bank account before loading the wallet"
		};
		if (!online) return {
			ok: false,
			reason: "Bank transfer needs a live connection"
		};
		if (amount <= 0) return {
			ok: false,
			reason: "Enter a valid bank transfer amount"
		};
		setMerchantBalance((m) => m + amount);
		push({
			id: rand(8),
			label: `Bank deposit · ${profile.bankAccount?.bankName ?? "Paymerch bank"}`,
			amount,
			type: "BANK_DEPOSIT",
			status: "SUCCESS",
			createdAt: Date.now()
		});
		return { ok: true };
	}, [
		online,
		profile,
		push
	]);
	const syncPending = (0, import_react.useCallback)(() => {
		let synced = 0;
		setTxns((prev) => prev.map((t) => {
			if (t.status !== "PENDING") return t;
			synced += 1;
			setMerchantBalance((m) => m + t.amount);
			return {
				...t,
				status: "SUCCESS",
				label: t.label.replace(" · Offline pending sync", " · Dynamic QR")
			};
		}));
		return synced;
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		profile,
		register,
		pinSet,
		lockout: {
			locked: lockedUntil !== null && Date.now() < lockedUntil,
			until: lockedUntil
		},
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
		clearBiometric
	}), [
		profile,
		register,
		pinSet,
		lockedUntil,
		buyerBalance,
		merchantBalance,
		online,
		txns,
		activeQr,
		generateQr,
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
		clearBiometric
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value,
		children
	});
}
function usePaymerch() {
	const ctx = (0, import_react.useContext)(Ctx);
	if (!ctx) throw new Error("usePaymerch must be used inside PaymerchProvider");
	return ctx;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function StatusBadge({ status }) {
	const map = {
		SUCCESS: "bg-success/15 text-success border-success/30",
		PENDING: "bg-warning/15 text-warning border-warning/30",
		FAILED: "bg-destructive/15 text-destructive border-destructive/30"
	};
	const label = {
		SUCCESS: "Success",
		PENDING: "Pending sync",
		FAILED: "Failed"
	}[status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide", map[status]),
		children: label
	});
}
function ActionTile({ icon, title, subtitle, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick,
		className: "flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground",
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-sm font-semibold text-foreground",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate text-xs text-muted-foreground",
				children: subtitle
			})]
		})]
	});
}
function Keypad({ onDigit, onBackspace, extra }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-3 gap-3",
		children: [
			[
				"1",
				"2",
				"3",
				"4",
				"5",
				"6",
				"7",
				"8",
				"9"
			].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeypadKey, {
				onPress: () => onDigit(k),
				children: k
			}, k)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeypadKey, {
				onPress: extra ? extra.onPress : () => onDigit("."),
				children: extra ? extra.label : "."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeypadKey, {
				onPress: () => onDigit("0"),
				children: "0"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeypadKey, {
				onPress: onBackspace,
				children: "⌫"
			})
		]
	});
}
function KeypadKey({ children, onPress }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: onPress,
		className: "rounded-2xl border border-border bg-card py-4 text-xl font-semibold text-foreground transition-transform active:scale-95 hover:bg-accent",
		children
	});
}
function ScreenHeader({ title, onBack }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-3 border-b border-border px-5 py-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onBack,
				className: "flex size-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-accent",
				"aria-label": "Return to main screen",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, {
					className: "size-4",
					"aria-hidden": "true"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/mlogopaymerch.png",
				alt: "Paymerch",
				className: "size-10 rounded-xl object-contain"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-base font-semibold text-foreground",
				children: title
			})
		]
	});
}
function MainButton({ onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		"aria-label": "Return to main screen",
		className: "absolute bottom-4 right-4 z-30 flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-panel transition-opacity hover:opacity-90",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, {
			className: "size-4",
			"aria-hidden": "true"
		}), "Main"]
	});
}
function AuthScreen({ onUnlock, goHome }) {
	const { verifyPin, lockout, webauthnSupported, credentialId, authenticateBiometric } = usePaymerch();
	const [pin, setPin] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [verifying, setVerifying] = (0, import_react.useState)(false);
	const [bioError, setBioError] = (0, import_react.useState)("");
	const [bioVerifying, setBioVerifying] = (0, import_react.useState)(false);
	const [lockRemaining, setLockRemaining] = (0, import_react.useState)(0);
	const isLocked = lockout.until !== null && lockRemaining > 0;
	const hasCredential = webauthnSupported && credentialId !== null;
	(0, import_react.useEffect)(() => {
		if (!lockout.until) return;
		const until = lockout.until;
		const update = () => {
			const remaining = Math.max(0, until - Date.now());
			setLockRemaining(remaining);
		};
		update();
		const interval = setInterval(update, 1e3);
		return () => clearInterval(interval);
	}, [lockout]);
	const submit = (0, import_react.useCallback)(async (value) => {
		setVerifying(true);
		const result = await verifyPin(value);
		setVerifying(false);
		if (result.ok) onUnlock();
		else if (result.locked) {
			setError("Too many attempts. Try again later.");
			setPin("");
		} else {
			setError("Incorrect PIN.");
			setPin("");
		}
	}, [verifyPin, onUnlock]);
	const onDigit = (d) => {
		if (pin.length >= 4 || !/\d/.test(d)) return;
		const next = pin + d;
		setPin(next);
		setError("");
		if (next.length === 4) setTimeout(() => submit(next), 180);
	};
	const onBiometric = (0, import_react.useCallback)(async () => {
		setBioVerifying(true);
		setBioError("");
		const result = await authenticateBiometric();
		setBioVerifying(false);
		if (result.ok) onUnlock();
		else setBioError(result.error || "Biometric authentication failed");
	}, [authenticateBiometric, onUnlock]);
	if (isLocked) {
		const mins = Math.ceil(lockRemaining / 6e4) || 1;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-full flex-col justify-center px-6 pb-8 pt-12",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/mlogopaymerch.png",
						alt: "Paymerch — Simply Secure Payments",
						className: "mx-auto h-48 w-auto object-contain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm font-semibold text-destructive",
						children: "Account locked"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: [
							"Too many failed attempts. Try again in ",
							mins,
							" min."
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MainButton, { onClick: goHome })]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col justify-between px-6 pb-8 pt-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/mlogopaymerch.png",
						alt: "Paymerch — Simply Secure Payments",
						className: "mx-auto h-48 w-auto object-contain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground",
						children: "Mobile"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "Your business. Your money. Even offline."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Enter your 4-digit PIN to continue"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center gap-3",
				children: [
					0,
					1,
					2,
					3
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-3.5 rounded-full border transition-colors ${pin.length > i ? "border-foreground bg-foreground" : "border-border bg-transparent"}` }, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "h-5 text-center text-xs font-medium text-destructive",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keypad, {
						onDigit,
						onBackspace: () => setPin((p) => p.slice(0, -1))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => submit(pin),
						disabled: pin.length !== 4 || verifying,
						className: "flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50",
						children: verifying ? "Verifying…" : "Unlock"
					}),
					hasCredential && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onBiometric,
						disabled: bioVerifying,
						className: "flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3.5 text-sm font-semibold text-foreground transition-opacity hover:opacity-90 disabled:opacity-50",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FingerprintPattern, { className: "size-4" }), bioVerifying ? "Verifying…" : "Use biometrics"]
					})
				]
			}),
			bioError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-xs font-medium text-destructive",
				children: bioError
			})
		]
	});
}
function PinSetupScreen({ onDone, goHome }) {
	const { createPin, registerBiometric, webauthnSupported, credentialId } = usePaymerch();
	const [pin, setPin] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [done, setDone] = (0, import_react.useState)(false);
	const onDigit = (d) => {
		if (pin.length >= 4 || !/\d/.test(d)) return;
		const next = pin + d;
		setPin(next);
		setError("");
	};
	const onConfirmDigit = (d) => {
		if (confirm.length >= 4 || !/\d/.test(d)) return;
		const next = confirm + d;
		setConfirm(next);
		setError("");
	};
	const submit = (0, import_react.useCallback)(async () => {
		if (pin.length !== 4 || confirm.length !== 4) return;
		if (pin !== confirm) {
			setError("PINs do not match.");
			setPin("");
			setConfirm("");
			return;
		}
		await createPin(pin);
		if (webauthnSupported && !credentialId) registerBiometric().catch(() => {});
		setDone(true);
		setTimeout(() => onDone(), 400);
	}, [
		pin,
		confirm,
		createPin,
		webauthnSupported,
		credentialId,
		registerBiometric,
		onDone
	]);
	if (done) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full flex-col justify-center px-6 pb-8 pt-12",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold text-success",
				children: "PIN set"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: "Your PIN has been secured. Enter it to continue."
			})]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col justify-between overflow-y-auto px-6 pb-8 pt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/mlogopaymerch.png",
						alt: "Paymerch",
						className: "mx-auto h-40 w-auto object-contain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground",
						children: "Mobile"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 text-xl font-bold text-foreground",
						children: "Set your PIN"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-5 text-muted-foreground",
						children: "Choose a 4-digit PIN you will use to unlock the app."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-semibold text-muted-foreground",
					children: "Create PIN"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 flex justify-center gap-3",
					children: [
						0,
						1,
						2,
						3
					].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-3.5 rounded-full border transition-colors ${pin.length > i ? "border-foreground bg-foreground" : "border-border bg-transparent"}` }, i))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-semibold text-muted-foreground",
					children: "Confirm PIN"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 flex justify-center gap-3",
					children: [
						0,
						1,
						2,
						3
					].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-3.5 rounded-full border transition-colors ${confirm.length > i ? "border-foreground bg-foreground" : "border-border bg-transparent"}` }, i))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "h-5 text-center text-xs font-medium text-destructive",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keypad, {
						onDigit,
						onBackspace: () => setPin((p) => p.slice(0, -1))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-[11px] text-muted-foreground",
						children: "Enter digits for Create PIN above"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keypad, {
						onDigit: onConfirmDigit,
						onBackspace: () => setConfirm((p) => p.slice(0, -1))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-[11px] text-muted-foreground",
						children: "Enter digits for Confirm PIN above"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: submit,
						disabled: pin.length !== 4 || confirm.length !== 4,
						className: "w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50",
						children: "Confirm PIN"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MainButton, { onClick: goHome })
		]
	});
}
var defaultBankAccount = {
	bankName: "FNB",
	accountHolder: "",
	accountNumber: "",
	branchCode: "",
	accountType: "Savings",
	isConfirmed: false
};
function RegisterScreen({ onDone }) {
	const { register } = usePaymerch();
	const [kind, setKind] = (0, import_react.useState)("business");
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [businessType, setBusinessType] = (0, import_react.useState)(BUSINESS_TYPES[0]);
	const [bankName, setBankName] = (0, import_react.useState)(defaultBankAccount.bankName);
	const [accountHolder, setAccountHolder] = (0, import_react.useState)("");
	const [accountNumber, setAccountNumber] = (0, import_react.useState)("");
	const [branchCode, setBranchCode] = (0, import_react.useState)("");
	const [accountType, setAccountType] = (0, import_react.useState)("Savings");
	const [bankConfirmed, setBankConfirmed] = (0, import_react.useState)(false);
	const canSubmit = name.trim().length > 1 && phone.trim().length >= 9 && accountHolder.trim().length >= 2 && accountNumber.trim().length >= 5 && branchCode.trim().length >= 3 && bankConfirmed;
	const submit = () => {
		if (!canSubmit) return;
		register({
			kind,
			name: name.trim(),
			phone: phone.trim(),
			businessType: kind === "business" ? businessType : void 0,
			bankAccount: {
				bankName,
				accountHolder: accountHolder.trim(),
				accountNumber: accountNumber.trim(),
				branchCode: branchCode.trim(),
				accountType,
				isConfirmed: true
			}
		});
		onDone();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col overflow-y-auto px-6 pb-8 pt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/mlogopaymerch.png",
						alt: "Paymerch",
						className: "mx-auto h-40 w-auto object-contain"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground",
						children: "Mobile"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 text-xl font-bold text-foreground",
						children: "Create your account"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-5 text-muted-foreground",
						children: "Confirm your bank account to fund your wallet, cash out, and move money between your bank and wallet."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid grid-cols-2 gap-3",
				children: [{
					id: "business",
					icon: Store,
					label: "Business",
					hint: "Spaza, stall, wash…"
				}, {
					id: "individual",
					icon: User,
					label: "Individual",
					hint: "Personal wallet"
				}].map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setKind(opt.id),
					className: `rounded-2xl border p-4 text-left transition-colors ${kind === opt.id ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-accent"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(opt.icon, { className: `size-5 ${kind === opt.id ? "text-primary" : "text-muted-foreground"}` }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm font-semibold text-foreground",
							children: opt.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: opt.hint
						})
					]
				}, opt.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold text-muted-foreground",
							children: kind === "business" ? "Business or trading name" : "Your full name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: kind === "business" ? "e.g. Mama Nandi's Spaza" : "e.g. Thabo Mokoena",
							className: "mt-1 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-semibold text-muted-foreground",
							children: "Cellphone number"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: phone,
							onChange: (e) => setPhone(e.target.value),
							placeholder: "e.g. 082 123 4567",
							inputMode: "tel",
							className: "mt-1 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
						})]
					}),
					kind === "business" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold text-muted-foreground",
						children: "Type of business"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 grid grid-cols-2 gap-2",
						children: BUSINESS_TYPES.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setBusinessType(t),
							className: `flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors ${businessType === t ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card text-muted-foreground hover:bg-accent"}`,
							children: [businessType === t && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 shrink-0 text-primary" }), t]
						}, t))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-2xl border border-border bg-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground",
									children: "Bank account"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-semibold text-muted-foreground",
										children: "Bank"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: bankName,
										onChange: (e) => setBankName(e.target.value),
										className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-semibold text-muted-foreground",
										children: "Account type"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: accountType,
										onChange: (e) => setAccountType(e.target.value),
										className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Savings" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Cheque" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Wallet" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: "Business" })
										]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid grid-cols-2 gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-semibold text-muted-foreground",
										children: "Account holder"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: accountHolder,
										onChange: (e) => setAccountHolder(e.target.value),
										className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-semibold text-muted-foreground",
										children: "Account number"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: accountNumber,
										onChange: (e) => setAccountNumber(e.target.value),
										inputMode: "numeric",
										className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-semibold text-muted-foreground",
										children: "Branch code"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										value: branchCode,
										onChange: (e) => setBranchCode(e.target.value),
										inputMode: "numeric",
										className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground"
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-3 flex items-center gap-2 rounded-xl border border-success/50 bg-success/10 px-3 py-2 text-[11px] font-semibold text-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: bankConfirmed,
										onChange: (e) => setBankConfirmed(e.target.checked),
										className: "size-4"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4 text-success" }),
									" Confirm account details for cash out and bank deposit"
								]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: submit,
				disabled: !canSubmit,
				className: "mt-6 w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50",
				children: "Register & set up PIN"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-center text-[11px] leading-4 text-muted-foreground",
				children: "Welcoming spaza shops, street vendors, car washes, taxi drivers, tshisa nyama, street food stalls and fruit & vegetable sellers."
			})
		]
	});
}
function Dashboard({ go }) {
	const { merchantBalance, online, setOnline, txns, pendingCount, syncPending, profile } = usePaymerch();
	const [visible, setVisible] = (0, import_react.useState)(true);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "border-b border-border px-5 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/mlogopaymerch.png",
						alt: "Paymerch",
						className: "size-10 rounded-xl object-contain"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-foreground",
							children: profile?.name ?? "My business"
						}),
						profile && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-muted-foreground",
							children: profile.kind === "business" ? profile.businessType : "Individual wallet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setOnline(!online),
							className: "flex items-center gap-1.5 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-2 rounded-full ${online ? "bg-success" : "bg-warning"}` }), online ? "Online" : "Offline mode"]
						})
					] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setVisible((v) => !v),
					className: "flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent",
					"aria-label": "Toggle balance visibility",
					children: visible ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-2xl bg-primary p-5 text-primary-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs opacity-70",
						children: "Wallet balance"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-3xl font-bold tracking-tight",
						children: visible ? formatZar(merchantBalance) : "R ••••••"
					}),
					pendingCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => syncPending(),
						disabled: !online,
						className: "mt-3 inline-flex items-center gap-1.5 rounded-full bg-warning px-3 py-1 text-[11px] font-semibold text-warning-foreground disabled:opacity-60",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3" }),
							pendingCount,
							" offline txn",
							pendingCount > 1 ? "s" : "",
							" —",
							" ",
							online ? "sync now" : "waiting for network"
						]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 space-y-3 overflow-y-auto px-5 py-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => go("scanner"),
					className: "flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-deep py-4 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-5" }), " Scan Dynamic QR"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionTile, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4" }),
							title: "Sell VAS",
							subtitle: "Airtime & prepaid electricity",
							onClick: () => go("vas")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionTile, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-4" }),
							title: "Bank to wallet",
							subtitle: "Move confirmed bank funds into your wallet",
							onClick: () => go("bankTopUp")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionTile, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "size-4" }),
							title: "Cash out",
							subtitle: "Move wallet funds to your bank",
							onClick: () => go("cashout")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActionTile, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-4" }),
							title: "Buyer pay mode",
							subtitle: "Generate a payment QR to pay someone",
							onClick: () => go("pay")
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
						children: "Recent activity"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: txns.slice(0, 5).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between rounded-2xl border border-border bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-medium text-foreground",
									children: t.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [new Date(t.createdAt).toLocaleTimeString("en-ZA", {
										hour: "2-digit",
										minute: "2-digit"
									}), t.token ? ` · token ${t.token}` : ""]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ml-3 shrink-0 text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-semibold text-foreground",
									children: formatZar(t.amount)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: t.status })]
							})]
						}, t.id))
					})]
				})
			]
		})]
	});
}
function PayMode({ onBack, onHome }) {
	const { buyerBalance, activeQr, generateQr, clearQr } = usePaymerch();
	const [raw, setRaw] = (0, import_react.useState)("");
	const [left, setLeft] = (0, import_react.useState)(60);
	const amount = Number(raw || "0") / 100;
	(0, import_react.useEffect)(() => {
		if (!activeQr) return;
		setLeft(60);
		const id = setInterval(() => {
			setLeft((v) => {
				if (v <= 1) {
					clearInterval(id);
					return 0;
				}
				return v - 1;
			});
		}, 1e3);
		return () => clearInterval(id);
	}, [activeQr]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
				title: "Pay mode",
				onBack
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col justify-between px-5 py-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs uppercase tracking-wider text-muted-foreground",
								children: "Amount to pay"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-4xl font-bold tracking-tight text-foreground",
								children: formatZar(amount)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: [
									"Buyer wallet · ",
									formatZar(buyerBalance),
									" available"
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keypad, {
						onDigit: (d) => /\d/.test(d) && setRaw((r) => (r + d).slice(0, 7)),
						onBackspace: () => setRaw((r) => r.slice(0, -1)),
						extra: {
							label: "C",
							onPress: () => setRaw("")
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: amount <= 0,
						onClick: () => generateQr(amount),
						className: "rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground disabled:opacity-40",
						children: "Generate Payment QR"
					})
				]
			}),
			activeQr && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-20 flex items-end bg-foreground/60 backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full rounded-t-3xl bg-card p-6 text-center shadow-panel",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-foreground",
							children: "Show this to the merchant"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: ["Single-use token · ", activeQr.txn_token]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto mt-4 w-fit rounded-2xl border border-border bg-background p-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRCodeSVG, {
								value: JSON.stringify(activeQr),
								size: 190,
								level: "M"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-2xl font-bold text-foreground",
							children: formatZar(activeQr.amt)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `text-sm font-semibold ${left > 10 ? "text-muted-foreground" : "text-destructive"}`,
							children: left > 0 ? `Expires in ${left}s` : "Token expired"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => {
								clearQr();
								setRaw("");
							},
							className: "mt-5 w-full rounded-2xl border border-border py-3 text-sm font-semibold text-foreground hover:bg-accent",
							children: "Close"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onHome ?? onBack,
							className: "mt-3 w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-primary-foreground",
							children: "Main screen"
						})
					]
				})
			})
		]
	});
}
function Scanner({ onBack }) {
	const { settleQr, online } = usePaymerch();
	const [result, setResult] = (0, import_react.useState)(null);
	const [payload, setPayload] = (0, import_react.useState)(null);
	const [permission, setPermission] = (0, import_react.useState)("prompt");
	const [error, setError] = (0, import_react.useState)(null);
	const [isScanning, setIsScanning] = (0, import_react.useState)(false);
	const videoRef = (0, import_react.useRef)(null);
	const controlsRef = (0, import_react.useRef)(null);
	const activeRef = (0, import_react.useRef)(false);
	const mountedRef = (0, import_react.useRef)(false);
	const errorTimerRef = (0, import_react.useRef)(null);
	const lastErrorRef = (0, import_react.useRef)(null);
	const showError = (0, import_react.useCallback)((text) => {
		const now = Date.now();
		if (lastErrorRef.current?.text === text && now - lastErrorRef.current.at < 2e3) return;
		lastErrorRef.current = {
			text,
			at: now
		};
		setError(text);
		if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
		errorTimerRef.current = setTimeout(() => setError(null), 4e3);
	}, []);
	const stopScan = (0, import_react.useCallback)(() => {
		activeRef.current = false;
		controlsRef.current?.stop();
		controlsRef.current = null;
		(videoRef.current?.srcObject)?.getTracks().forEach((track) => track.stop());
		if (videoRef.current) videoRef.current.srcObject = null;
		if (errorTimerRef.current) {
			clearTimeout(errorTimerRef.current);
			errorTimerRef.current = null;
		}
		setIsScanning(false);
	}, []);
	const handleScanResult = (0, import_react.useCallback)((decoded) => {
		if (!activeRef.current) return;
		const text = decoded.getText();
		let parsed = null;
		try {
			const value = JSON.parse(text);
			if (value && typeof value.ver === "string" && typeof value.txn_token === "string" && value.txn_token.length > 0 && typeof value.buyer_wallet === "string" && typeof value.amt === "number" && Number.isFinite(value.amt) && value.amt > 0 && value.cur === "ZAR" && typeof value.exp === "number" && typeof value.sig === "string" && value.sig.length > 0) parsed = value;
		} catch {
			parsed = null;
		}
		if (!parsed) {
			showError("Invalid QR code format — expected a Paymerch payment QR");
			return;
		}
		activeRef.current = false;
		setPayload(parsed);
		const res = settleQr(parsed);
		setResult({
			ok: res.ok,
			text: res.ok ? online ? `Payment of ${new Intl.NumberFormat("en-ZA", {
				style: "currency",
				currency: "ZAR"
			}).format(parsed.amt)} received` : `${new Intl.NumberFormat("en-ZA", {
				style: "currency",
				currency: "ZAR"
			}).format(parsed.amt)} cached offline — will sync when back online` : res.reason ?? "Transaction declined"
		});
		stopScan();
	}, [
		online,
		settleQr,
		showError,
		stopScan
	]);
	const startScan = (0, import_react.useCallback)(async () => {
		const video = videoRef.current;
		if (!video || activeRef.current) return;
		activeRef.current = true;
		setPermission("loading");
		setError(null);
		setResult(null);
		setPayload(null);
		lastErrorRef.current = null;
		try {
			const controls = await new BrowserQRCodeReader().decodeFromVideoDevice(void 0, video, (decoded) => {
				if (decoded) handleScanResult(decoded);
			});
			if (!mountedRef.current) {
				controls.stop();
				activeRef.current = false;
				return;
			}
			controlsRef.current = controls;
			setPermission("granted");
			setIsScanning(true);
		} catch (err) {
			activeRef.current = false;
			controlsRef.current?.stop();
			controlsRef.current = null;
			video.srcObject?.getTracks().forEach((track) => track.stop());
			video.srcObject = null;
			if (err instanceof DOMException && err.name === "NotAllowedError") {
				setPermission("denied");
				showError("Camera permission denied");
			} else {
				setPermission("denied");
				showError(err instanceof Error ? err.message : "Failed to start camera");
			}
		}
	}, [handleScanResult]);
	(0, import_react.useEffect)(() => {
		mountedRef.current = true;
		startScan();
		return () => {
			mountedRef.current = false;
			stopScan();
		};
	}, [startScan, stopScan]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col bg-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "bg-background",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
				title: "Scan Dynamic QR",
				onBack
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex flex-1 flex-col items-center justify-center gap-6 p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative size-60 overflow-hidden rounded-3xl border-2 border-dashed border-background/40",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
							ref: videoRef,
							className: "absolute inset-0 size-full object-cover",
							playsInline: true,
							muted: true,
							autoPlay: true,
							"aria-label": "QR scanner camera preview"
						}),
						permission !== "granted" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center",
							children: [
								permission === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-8 animate-spin text-brand" }),
								permission === "denied" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoOff, { className: "size-8 text-background/50" }),
								permission === "prompt" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, { className: "size-8 text-background/50" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-background/70",
									children: permission === "loading" ? "Starting camera…" : permission === "denied" ? "Camera access denied — enable it in browser settings" : "Camera preview will appear here"
								}),
								(permission === "denied" || permission === "prompt") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: startScan,
									className: "rounded-xl bg-background px-4 py-2 text-sm font-medium text-foreground",
									children: permission === "denied" ? "Retry" : "Start camera"
								})
							]
						}),
						isScanning && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-x-6 top-1/2 h-0.5 animate-pulse bg-brand" })
					]
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "w-full max-w-xs text-center text-sm text-destructive",
					role: "alert",
					children: error
				}),
				permission === "granted" && !isScanning && !result && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: startScan,
					className: "rounded-2xl bg-background px-6 py-3.5 text-sm font-semibold text-foreground",
					children: "Resume scanning"
				}),
				result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-xs rounded-2xl bg-card p-5 text-left animate-in fade-in slide-in-from-bottom-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [result.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-success" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "size-5 text-destructive" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-foreground",
							children: result.text
						})]
					}), payload && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "mt-3 overflow-x-auto rounded-xl bg-secondary p-3 text-[10px] leading-relaxed text-muted-foreground",
						children: JSON.stringify(payload, null, 2)
					})]
				})
			]
		})]
	});
}
var VALUES = [
	20,
	50,
	100,
	200
];
function VasScreen({ onBack }) {
	const { sellVas } = usePaymerch();
	const [kind, setKind] = (0, import_react.useState)("VAS_ELEC");
	const [target, setTarget] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)(50);
	const [receipt, setReceipt] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: "Sell value-added services",
			onBack
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 space-y-5 overflow-y-auto px-5 py-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [{
						k: "VAS_ELEC",
						label: "Electricity",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4" })
					}, {
						k: "VAS_AIRTIME",
						label: "Airtime",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-4" })
					}].map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							setKind(o.k);
							setReceipt(null);
						},
						className: `flex items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold transition-colors ${kind === o.k ? "border-transparent bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-accent"}`,
						children: [o.icon, o.label]
					}, o.k))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
						children: kind === "VAS_ELEC" ? "Meter number" : "Phone number"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: target,
						onChange: (e) => setTarget(e.target.value),
						inputMode: "numeric",
						placeholder: kind === "VAS_ELEC" ? "0412 3456 7890 1234" : "082 000 0000",
						className: "mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
					children: "Value"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 grid grid-cols-4 gap-2",
					children: VALUES.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setAmount(v),
						className: `rounded-xl border py-3 text-sm font-semibold transition-colors ${amount === v ? "border-transparent bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-accent"}`,
						children: ["R", v]
					}, v))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					disabled: target.trim().length < 4,
					onClick: () => setReceipt(sellVas(kind, target.trim(), amount)),
					className: "w-full rounded-2xl bg-brand-deep py-4 text-base font-semibold text-primary-foreground disabled:opacity-40",
					children: ["Vend ", formatZar(amount)]
				}),
				receipt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-success/30 bg-success/10 p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold text-foreground",
							children: receipt.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								formatZar(receipt.amount),
								" ·",
								" ",
								receipt.status === "SUCCESS" ? "Vended" : "Queued offline"
							]
						}),
						receipt.token && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
								children: "STS token"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
									className: "flex-1 rounded-xl bg-card px-3 py-2 text-sm tracking-widest text-foreground",
									children: receipt.token.replace(/(\d{4})(?=\d)/g, "$1 ")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => navigator.clipboard?.writeText(receipt.token),
									className: "flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-accent",
									"aria-label": "Copy token",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" })
								})]
							})]
						})
					]
				})
			]
		})]
	});
}
function CashOut({ onBack }) {
	const { merchantBalance, cashOut, profile } = usePaymerch();
	const [raw, setRaw] = (0, import_react.useState)("");
	const [msg, setMsg] = (0, import_react.useState)(null);
	const amount = Number(raw || "0") / 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: "Cash out",
			onBack
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col justify-between px-5 py-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-wider text-muted-foreground",
							children: "Amount to withdraw"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-4xl font-bold tracking-tight text-foreground",
							children: formatZar(amount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: ["Available ", formatZar(merchantBalance)]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-[11px] font-semibold text-muted-foreground",
							children: profile?.bankAccount?.isConfirmed ? `Cash out to ${profile.bankAccount.bankName} · ${profile.bankAccount.accountNumber}` : "Confirm your bank account before cashing out"
						}),
						msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `mt-3 text-sm font-semibold ${msg.ok ? "text-success" : "text-destructive"}`,
							children: msg.text
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keypad, {
					onDigit: (d) => /\d/.test(d) && setRaw((r) => (r + d).slice(0, 7)),
					onBackspace: () => setRaw((r) => r.slice(0, -1)),
					extra: {
						label: "C",
						onPress: () => setRaw("")
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					disabled: amount <= 0,
					onClick: () => {
						const res = cashOut(amount);
						setMsg(res.ok ? {
							ok: true,
							text: `Transfer sent to ${profile?.bankAccount?.bankName ?? "your bank"}`
						} : {
							ok: false,
							text: res.reason
						});
						if (res.ok) setRaw("");
					},
					className: "rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground disabled:opacity-40",
					children: "Withdraw to bank"
				})
			]
		})]
	});
}
function BankTopUp({ onBack }) {
	const { merchantBalance, bankToWallet, profile } = usePaymerch();
	const [raw, setRaw] = (0, import_react.useState)("");
	const [msg, setMsg] = (0, import_react.useState)(null);
	const amount = Number(raw || "0") / 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: "Bank top-up",
			onBack
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col justify-between px-5 py-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-7" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs uppercase tracking-wider text-muted-foreground",
							children: "Bank to wallet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-4xl font-bold tracking-tight text-foreground",
							children: formatZar(amount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: profile?.bankAccount?.isConfirmed ? "Confirmed bank account" : "No confirmed bank account"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: [
								"Wallet ",
								formatZar(merchantBalance),
								" ·",
								" ",
								profile?.bankAccount?.bankName ?? "Paymerch Bank"
							]
						}),
						msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `mt-3 text-sm font-semibold ${msg.ok ? "text-success" : "text-destructive"}`,
							children: msg.text
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keypad, {
					onDigit: (d) => /\d/.test(d) && setRaw((r) => (r + d).slice(0, 7)),
					onBackspace: () => setRaw((r) => r.slice(0, -1)),
					extra: {
						label: "C",
						onPress: () => setRaw("")
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					disabled: amount <= 0,
					onClick: () => {
						const res = bankToWallet(amount);
						setMsg(res.ok ? {
							ok: true,
							text: "Bank transfer loaded to wallet"
						} : {
							ok: false,
							text: res.reason
						});
						if (res.ok) setRaw("");
					},
					className: "flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-deep py-4 text-base font-semibold text-primary-foreground disabled:opacity-40",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownToLine, { className: "size-4" }), " Deposit from bank"]
				})
			]
		})]
	});
}
function SplashScreen({ onComplete }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "splash-screen flex h-full flex-col items-center justify-center bg-background px-8 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "splash-logo-wrap",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/mlogopaymerch.png",
					alt: "Paymerch",
					className: "splash-logo h-56 w-auto object-contain"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "splash-mobile mt-2 text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground",
				children: "Mobile"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "splash-tagline mt-7 max-w-xs text-sm font-semibold leading-6 text-foreground",
				children: "Simple payments for every informal trader"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "splash-description mt-2 max-w-xs text-xs leading-5 text-muted-foreground",
				children: "Built for spaza shops, street vendors, car washes, taxi drivers, food stalls, tshisa nyama and fresh produce sellers."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: (event) => {
					event.stopPropagation();
					onComplete();
				},
				className: "splash-status mt-6 inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]",
				children: "Get Started"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "splash-status absolute bottom-10 flex items-center gap-2 text-xs font-medium text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-success motion-safe:animate-pulse" }), "Works online and offline"]
			})
		]
	});
}
function PaymerchApp() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymerchProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-secondary px-4 py-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto w-full max-w-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {})
		})
	}) });
}
function Shell() {
	const { profile, pinSet } = usePaymerch();
	const [showSplash, setShowSplash] = (0, import_react.useState)(true);
	const [unlocked, setUnlocked] = (0, import_react.useState)(false);
	const [screen, setScreen] = (0, import_react.useState)("dashboard");
	const finishSplash = (0, import_react.useCallback)(() => setShowSplash(false), []);
	const goHome = (0, import_react.useCallback)(() => setScreen("dashboard"), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-[720px] overflow-hidden rounded-[2.25rem] border border-border bg-background shadow-panel",
		children: [showSplash ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SplashScreen, { onComplete: finishSplash }) : !profile ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RegisterScreen, { onDone: () => {} }) : !pinSet ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinSetupScreen, {
			onDone: () => {},
			goHome
		}) : !unlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthScreen, {
			onUnlock: () => setUnlocked(true),
			goHome
		}) : screen === "dashboard" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, { go: setScreen }) : screen === "scanner" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scanner, { onBack: goHome }) : screen === "pay" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PayMode, {
			onBack: goHome,
			onHome: goHome
		}) : screen === "vas" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VasScreen, { onBack: goHome }) : screen === "cashout" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CashOut, { onBack: goHome }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BankTopUp, { onBack: goHome }), !showSplash && profile && pinSet && unlocked && screen !== "dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MainButton, { onClick: goHome })]
	}) });
}
function Index() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "sr-only",
		children: "Paymerch Mobile — Simply Secure Payments"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymerchApp, {})] });
}
//#endregion
export { Index as component };
