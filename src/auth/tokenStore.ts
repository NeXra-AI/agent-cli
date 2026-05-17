// ~/.nexra/credentials.json 读写 — chmod 600
import { readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync, unlinkSync } from "node:fs";
import { CREDENTIALS_FILE, NEXRA_DIR, getCurrentProfile } from "../config.js";

export type ProfileCreds = {
  access_token: string;
  refresh_token: string;
  expires_at: string; // ISO
  scope: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
  saved_at: string;
};

export type CredentialsFile = {
  default_profile: string;
  profiles: Record<string, ProfileCreds>;
};

function ensureDir() {
  if (!existsSync(NEXRA_DIR)) {
    mkdirSync(NEXRA_DIR, { recursive: true, mode: 0o700 });
  }
}

export function readAll(): CredentialsFile {
  if (!existsSync(CREDENTIALS_FILE)) {
    return { default_profile: "default", profiles: {} };
  }
  try {
    return JSON.parse(readFileSync(CREDENTIALS_FILE, "utf8"));
  } catch {
    return { default_profile: "default", profiles: {} };
  }
}

export function writeAll(creds: CredentialsFile) {
  ensureDir();
  writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2), { mode: 0o600 });
  try {
    chmodSync(CREDENTIALS_FILE, 0o600);
  } catch {
    // Windows may not support; ignore
  }
}

export function getCurrent(): ProfileCreds | null {
  const all = readAll();
  // 优先: 显式选的 profile (--profile flag / NEXRA_PROFILE env)
  const p = getCurrentProfile();
  if (all.profiles[p]) return all.profiles[p];
  // 降级: credentials.json 里的 default_profile (避免 NEXRA_PROFILE 未设 + 第一次只有 acme)
  if (p === "default" && all.default_profile && all.profiles[all.default_profile]) {
    return all.profiles[all.default_profile];
  }
  return null;
}

export function saveCurrent(creds: ProfileCreds) {
  const all = readAll();
  all.profiles[getCurrentProfile()] = creds;
  if (!all.default_profile) all.default_profile = getCurrentProfile();
  writeAll(all);
}

export function clearCurrent() {
  const all = readAll();
  delete all.profiles[getCurrentProfile()];
  writeAll(all);
}

export function deleteCredentialsFile() {
  if (existsSync(CREDENTIALS_FILE)) {
    unlinkSync(CREDENTIALS_FILE);
  }
}
