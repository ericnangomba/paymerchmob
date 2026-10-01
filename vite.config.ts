// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    build: {
      outDir: "dist",
      emptyOutDir: false,
    },
    environments: {
      client: {
        build: {
          outDir: "dist",
        },
      },
      server: {
        build: {
          outDir: "dist/server",
        },
      },
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this.
    // Netlify currently fails during prerender because the preview plugin expects a generated
    // dist/server/server.js that isn't produced in this setup, so disable prerender here.
    server: { entry: "server" },
    prerender: {
      enabled: false,
    },
  },
});
