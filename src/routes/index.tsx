import { createFileRoute } from "@tanstack/react-router";
import { PaymerchApp } from "@/components/paymerch/PaymerchApp";

const title = "Paymerch Mobile — Simply Secure Payments";
const description =
  "Phone-to-phone wallet prototype: dynamic QR payments, airtime and electricity vending, and offline transaction caching.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <h1 className="sr-only">Paymerch Mobile — Simply Secure Payments</h1>
      <PaymerchApp />
    </main>
  );
}
