import { defineConfig } from "vite";

export default defineConfig({
  logLevel: "silent",
  build: {
    ssr: "src/credential-setup.js",
    outDir: ".vite/credential-setup",
    emptyOutDir: true,
    target: "node22",
    rollupOptions: {
      external: ["@napi-rs/keyring"],
      output: {
        format: "cjs",
        entryFileNames: "credential-setup.cjs",
      },
    },
  },
});
