import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { AlertTriangle, Camera, CheckCircle2, Loader2, VideoOff } from "lucide-react";
import { usePaymerch, type QrPayload } from "@/lib/paymerch-store";
import { ScreenHeader } from "./ui";

type PermissionState = "prompt" | "granted" | "denied" | "loading";
type DecodedResult = { getText(): string };

export function Scanner({ onBack }: { onBack: () => void }) {
  const { settleQr, online } = usePaymerch();
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [payload, setPayload] = useState<QrPayload | null>(null);
  const [permission, setPermission] = useState<PermissionState>("prompt");
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const activeRef = useRef(false);
  const mountedRef = useRef(false);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastErrorRef = useRef<{ text: string; at: number } | null>(null);

  const showError = useCallback((text: string) => {
    const now = Date.now();
    if (lastErrorRef.current?.text === text && now - lastErrorRef.current.at < 2000) return;
    lastErrorRef.current = { text, at: now };
    setError(text);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setError(null), 4000);
  }, []);

  const stopScan = useCallback(() => {
    activeRef.current = false;
    controlsRef.current?.stop();
    controlsRef.current = null;
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const handleScanResult = useCallback(
    (decoded: DecodedResult) => {
      if (!activeRef.current) return;
      const text = decoded.getText();
      let parsed: QrPayload | null = null;
      try {
        const value = JSON.parse(text) as Partial<QrPayload>;
        if (
          value &&
          typeof value.ver === "string" &&
          typeof value.txn_token === "string" &&
          value.txn_token.length > 0 &&
          typeof value.buyer_wallet === "string" &&
          typeof value.amt === "number" &&
          Number.isFinite(value.amt) &&
          value.amt > 0 &&
          value.cur === "ZAR" &&
          typeof value.exp === "number" &&
          typeof value.sig === "string" &&
          value.sig.length > 0
        ) {
          parsed = value as QrPayload;
        }
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
        text: res.ok
          ? online
            ? `Payment of ${new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(parsed.amt)} received`
            : `${new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(parsed.amt)} cached offline — will sync when back online`
          : res.reason ?? "Transaction declined",
      });
      stopScan();
    },
    [online, settleQr, showError, stopScan],
  );

  const startScan = useCallback(async () => {
    const video = videoRef.current;
    if (!video || activeRef.current) return;

    activeRef.current = true;
    setPermission("loading");
    setError(null);
    setResult(null);
    setPayload(null);
    lastErrorRef.current = null;

    try {
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromVideoDevice(undefined, video, (decoded) => {
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
      const stream = video.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
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

  useEffect(() => {
    mountedRef.current = true;
    void startScan();
    return () => {
      mountedRef.current = false;
      stopScan();
    };
  }, [startScan, stopScan]);

  return (
    <div className="flex h-full flex-col bg-foreground">
      <div className="bg-background">
        <ScreenHeader title="Scan Dynamic QR" onBack={onBack} />
      </div>
      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <div className="relative size-60 overflow-hidden rounded-3xl border-2 border-dashed border-background/40">
          <video
            ref={videoRef}
            className="absolute inset-0 size-full object-cover"
            playsInline
            muted
            autoPlay
            aria-label="QR scanner camera preview"
          />
          {permission !== "granted" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
              {permission === "loading" && <Loader2 className="size-8 animate-spin text-brand" />}
              {permission === "denied" && <VideoOff className="size-8 text-background/50" />}
              {permission === "prompt" && <Camera className="size-8 text-background/50" />}
              <p className="text-sm text-background/70">
                {permission === "loading"
                  ? "Starting camera…"
                  : permission === "denied"
                    ? "Camera access denied — enable it in browser settings"
                    : "Camera preview will appear here"}
              </p>
              {(permission === "denied" || permission === "prompt") && (
                <button
                  type="button"
                  onClick={startScan}
                  className="rounded-xl bg-background px-4 py-2 text-sm font-medium text-foreground"
                >
                  {permission === "denied" ? "Retry" : "Start camera"}
                </button>
              )}
            </div>
          )}
          {isScanning && <span className="absolute inset-x-6 top-1/2 h-0.5 animate-pulse bg-brand" />}
        </div>

        {error && (
          <p className="w-full max-w-xs text-center text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {permission === "granted" && !isScanning && !result && (
          <button type="button" onClick={startScan} className="rounded-2xl bg-background px-6 py-3.5 text-sm font-semibold text-foreground">
            Resume scanning
          </button>
        )}

        {result && (
          <div className="w-full max-w-xs rounded-2xl bg-card p-5 text-left animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2">
              {result.ok ? (
                <CheckCircle2 className="size-5 text-success" />
              ) : (
                <AlertTriangle className="size-5 text-destructive" />
              )}
              <p className="text-sm font-semibold text-foreground">{result.text}</p>
            </div>
            {payload && (
              <pre className="mt-3 overflow-x-auto rounded-xl bg-secondary p-3 text-[10px] leading-relaxed text-muted-foreground">
                {JSON.stringify(payload, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
