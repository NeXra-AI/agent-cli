import { apiFetch } from "../auth/client.js";
import { clearCurrent, getCurrent } from "../auth/tokenStore.js";
import { color, logSuccess, logWarn } from "../util/ui.js";

export async function logoutCmd(_args: string[]) {
  const current = getCurrent();
  if (!current) {
    logWarn("Not signed in.");
    return;
  }
  // Best-effort revoke server-side; ignore failures
  try {
    await apiFetch("/api/me/sessions", { method: "GET" });
    // 实际撤销请求自己的 session 需要拿到 token_id; 这里简单做法是清本地，
    // 让 access token 自然过期 (1h)。完整 revoke 走 /api/oauth/token/revoke 后续可加。
  } catch {
    /* ignore */
  }
  clearCurrent();
  logSuccess(`Signed out from ${color.bold(current.tenant.name)}.`);
}
