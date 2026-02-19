import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { randomUUID } from "crypto";

/**
 * Vite plugin that writes a version.json file into the build output.
 * The file contains a unique buildHash generated at build time.
 * The VersionChecker component fetches this file to detect new deploys.
 */
function versionJsonPlugin(): Plugin {
  const buildHash = randomUUID();
  return {
    name: "version-json",
    apply: "build",
    closeBundle() {
      const versionFile = resolve(__dirname, "dist", "version.json");
      writeFileSync(
        versionFile,
        JSON.stringify({ buildHash, builtAt: new Date().toISOString() }),
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), versionJsonPlugin()],
});
