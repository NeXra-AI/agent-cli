// authed fetch — 自动加 Bearer，401 自动 refresh，刷不动就让命令 throw
import { API_BASE, USER_AGENT } from "../config.js";
import { getCurrent, saveCurrent } from "./tokenStore.js";

export class NotLoggedIn extends Error {
  constructor() {
    super("Not logged in. Run: nexra login");
  }
}

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any) {
    super(`HTTP ${status}: ${typeof body === "string" ? body : JSON.stringify(body)}`);
    this.status = status;
    this.body = body;
  }
}

export type FetchOpts = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  query?: Record<string, string | number | boolean | undefined>;
  body?: any;
  headers?: Record<string, string>;
  /** Skip Bearer (for public endpoints like /oauth/device/*) */
  noAuth?: boolean;
};

export async function apiFetch<T = any>(path: string, opts: FetchOpts = {}): Promise<T> {
  const url = new URL(API_BASE + path);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {
    "User-Agent": USER_AGENT,
    "Content-Type": "application/json",
    ...(opts.headers || {}),
  };

  if (!opts.noAuth) {
    const creds = getCurrent();
    if (!creds) throw new NotLoggedIn();
    headers["Authorization"] = `Bearer ${creds.access_token}`;
  }

  const init: RequestInit = {
    method: opts.method || "GET",
    headers,
  };
  if (opts.body !== undefined) {
    init.body = typeof opts.body === "string" ? opts.body : JSON.stringify(opts.body);
  }

  let resp = await fetch(url, init);

  // 401 → 尝试 refresh 一次
  if (resp.status === 401 && !opts.noAuth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const creds = getCurrent();
      if (creds) headers["Authorization"] = `Bearer ${creds.access_token}`;
      init.headers = headers;
      resp = await fetch(url, init);
    } else {
      throw new NotLoggedIn();
    }
  }

  if (!resp.ok) {
    // Read body ONCE as text, then try parse JSON. Reading twice (.json then .text on
    // catch) throws 'Body is unusable' on Node fetch.
    const errText = await resp.text();
    let errBody: any = errText;
    try {
      errBody = JSON.parse(errText);
    } catch {
      // not JSON, keep as text
    }
    throw new ApiError(resp.status, errBody);
  }

  // 202 pending 也算 ok，由调用方处理
  const text = await resp.text();
  if (!text) return undefined as any;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as any;
  }
}

async function tryRefresh(): Promise<boolean> {
  const creds = getCurrent();
  if (!creds) return false;
  try {
    const url = new URL(API_BASE + "/api/oauth/device/token");
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: creds.refresh_token,
      }),
    });
    if (!r.ok) return false;
    const j = (await r.json()) as any;
    saveCurrent({
      access_token: j.access_token,
      refresh_token: j.refresh_token,
      expires_at: new Date(Date.now() + (j.expires_in || 3600) * 1000).toISOString(),
      scope: j.scope || creds.scope,
      tenant: j.tenant || creds.tenant,
      saved_at: new Date().toISOString(),
    });
    return true;
  } catch {
    return false;
  }
}
