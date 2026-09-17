import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/screen")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
