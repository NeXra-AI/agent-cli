import { apiFetch } from "../auth/client.js";
import { getCurrent } from "../auth/tokenStore.js";
import { color, logError } from "../util/ui.js";
import { API_BASE } from "../config.js";

export async function whoamiCmd(_args: string[]) {
  const current = getCurrent();
  if (!current) {
    logError("Not signed in. Run: nexra login");
    process.exit(1);
  }

  try {
    const me = await apiFetch<any>("/api/me");
    const t = me.tenant || current.tenant;
    const q = me.quota || {};
    console.log();
    console.log(color.bold("NeXra Agent CLI"));
    console.log();
    console.log(`  Tenant:  ${color.cyan(t.name)} ${color.gray(`(${t.slug})`)}`);
    console.log(`  Plan:    ${color.magenta(t.plan || "free")}`);
    console.log(`  Scope:   ${color.gray(me.scope || current.scope)}`);
    console.log(`  API:     ${color.gray(API_BASE)}`);
    if (q && Object.keys(q).length) {
      console.log();
      console.log(color.bold("Quota"));
      if (q.allowed !== undefined)
        console.log(`  Status:        ${q.allowed ? color.green("active") : color.red("blocked")}`);
      if (q.plan) console.log(`  Plan:          ${q.plan}`);
      if (q.used_5h !== undefined) console.log(`  Used (5h):     RM ${q.used_5h}`);
      if (q.used_7d !== undefined) console.log(`  Used (7d):     RM ${q.used_7d}`);
      if (q.used_30d !== undefined) console.log(`  Used (30d):    RM ${q.used_30d}`);
      if (q.monthly_remaining !== undefined)
        console.log(`  Remaining:     RM ${q.monthly_remaining}`);
      if (q.note) console.log(color.gray(`  ${q.note}`));
    }
    console.log();
  } catch (e: any) {
    logError(`Could not fetch profile: ${e.message}`);
    process.exit(1);
  }
}
