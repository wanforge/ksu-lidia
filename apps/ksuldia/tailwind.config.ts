import type { Config } from "tailwindcss";
import sharedConfig from "tailwind-config";

const config: Pick<Config, "prefix" | "presets" | "content"> = {
  content: [
    // NOTE: include .ts too — some class strings live in plain .ts files
    // (e.g. src/app/shared/confirm.ts builds SweetAlert button classes).
    // Scanning only .tsx purges those, hiding the styled confirm button.
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/rizzui/dist/**/*.{js,mjs,ts,jsx,tsx}",
    "../../packages/isomorphic-core/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [sharedConfig],
};

export default config;
