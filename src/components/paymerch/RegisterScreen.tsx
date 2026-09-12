import { useState } from "react";
import { Store, User, Check } from "lucide-react";
import logo from "@/assets/paymerchlogo.png.asset.json";
import { BUSINESS_TYPES, usePaymerch, type AccountKind, type BusinessType } from "@/lib/paymerch-store";

export function RegisterScreen({ onDone }: { onDone: () => void }) {
  const { register } = usePaymerch();
  const [kind, setKind] = useState<AccountKind>("business");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>(BUSINESS_TYPES[0]);

  const canSubmit = name.trim().length > 1 && phone.trim().length >= 9;

  const submit = () => {
    if (!canSubmit) return;
    register({
      kind,
      name: name.trim(),
      phone: phone.trim(),
      businessType: kind === "business" ? businessType : undefined,
    });
    onDone();
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-10">
      <div className="text-center">
        <img src={logo.url} alt="Paymerch — Simply Secure Payments" className="mx-auto h-16 w-auto object-contain" />
        <h1 className="mt-4 text-xl font-bold text-foreground">Create your account</h1>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          No bank account needed. Register as an individual or any informal business.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {(
          [
            { id: "business", icon: Store, label: "Business", hint: "Spaza, stall, wash…" },
            { id: "individual", icon: User, label: "Individual", hint: "Personal wallet" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.id}
            onClick={() => setKind(opt.id)}
            className={`rounded-2xl border p-4 text-left transition-colors ${
              kind === opt.id ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-accent"
            }`}
          >
            <opt.icon className={`size-5 ${kind === opt.id ? "text-primary" : "text-muted-foreground"}`} />
            <p className="mt-2 text-sm font-semibold text-foreground">{opt.label}</p>
            <p className="text-[11px] text-muted-foreground">{opt.hint}</p>
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">
            {kind === "business" ? "Business or trading name" : "Your full name"}
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={kind === "business" ? "e.g. Mama Nandi's Spaza" : "e.g. Thabo Mokoena"}
            className="mt-1 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Cellphone number</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 082 123 4567"
            inputMode="tel"
            className="mt-1 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        {kind === "business" && (
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Type of business</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {BUSINESS_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setBusinessType(t)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                    businessType === t
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {businessType === t && <Check className="size-3.5 shrink-0 text-primary" />}
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Register & set up PIN
      </button>
      <p className="mt-3 text-center text-[11px] leading-4 text-muted-foreground">
        Welcoming spaza shops, street vendors, car washes, tshisa nyama, street food stalls and fruit & vegetable
        sellers.
      </p>
    </div>
  );
}
