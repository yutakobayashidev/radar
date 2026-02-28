import type { ClientState } from "xnotif";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { STATE_FILE } from "./config.js";

export function loadState(): ClientState | undefined {
  if (existsSync(STATE_FILE)) {
    try {
      return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function saveState(state: ClientState): void {
  writeFileSync(STATE_FILE, JSON.stringify(state));
}
