// Per-profile local state (session_id, selected agent_id, scratch settings).
// Stored at ~/.nexra/state.json (chmod 600 same as credentials).
import { readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync } from "node:fs";
import { join } from "node:path";
import { NEXRA_DIR, getCurrentProfile } from "./config.js";

const STATE_FILE = join(NEXRA_DIR, "state.json");

type ProfileState = {
  session_id?: string;       // for nexra chat continuity
  agent_id?: number;         // CLI-bound agent (set via `nexra agents use N`)
};

type StateFile = {
  profiles: Record<string, ProfileState>;
};

function ensureDir() {
  if (!existsSync(NEXRA_DIR)) mkdirSync(NEXRA_DIR, { recursive: true, mode: 0o700 });
}

function read(): StateFile {
  if (!existsSync(STATE_FILE)) return { profiles: {} };
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { profiles: {} };
  }
}

function write(s: StateFile) {
  ensureDir();
  writeFileSync(STATE_FILE, JSON.stringify(s, null, 2), { mode: 0o600 });
  try {
    chmodSync(STATE_FILE, 0o600);
  } catch {}
}

function getProfile(): ProfileState {
  const all = read();
  return all.profiles[getCurrentProfile()] || {};
}

function setProfile(p: ProfileState) {
  const all = read();
  all.profiles[getCurrentProfile()] = p;
  write(all);
}

export function getSessionId(): string | undefined {
  return getProfile().session_id;
}

export function saveSessionId(sid: string | undefined) {
  const p = getProfile();
  if (sid) p.session_id = sid;
  else delete p.session_id;
  setProfile(p);
}

export function getDefaultAgentId(): number | undefined {
  return getProfile().agent_id;
}

export function saveDefaultAgentId(id: number | undefined) {
  const p = getProfile();
  if (id !== undefined) p.agent_id = id;
  else delete p.agent_id;
  setProfile(p);
}
