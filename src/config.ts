// CLI 全局配置 — base URL、文件路径、版本
import { homedir } from "node:os";
import { join } from "node:path";

export const VERSION = "0.5.7";

// 平台 API base URL。可通过 NEXRA_API_URL 覆盖（本地开发用 http://localhost:20009）
export const API_BASE =
  process.env.NEXRA_API_URL?.replace(/\/$/, "") ||
  "https://api.nexra-ai.co";

// 凭证文件目录
export const NEXRA_DIR = process.env.NEXRA_HOME || join(homedir(), ".nexra");
export const CREDENTIALS_FILE = join(NEXRA_DIR, "credentials.json");
export const CONFIG_FILE = join(NEXRA_DIR, "config.json");

// 当前 profile — 可被 setCurrentProfile() 覆盖 (来自 --profile flag)
let _currentProfile: string = process.env.NEXRA_PROFILE || "default";
export function getCurrentProfile(): string {
  return _currentProfile;
}
export function setCurrentProfile(name: string): void {
  _currentProfile = name;
}
/** @deprecated import getCurrentProfile() — 这个常量在 module init 时 snapshot */
export const CURRENT_PROFILE = _currentProfile;

export const USER_AGENT = `nexra-cli/${VERSION} (${process.platform}; ${process.arch})`;
