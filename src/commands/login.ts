import { deviceLogin } from "../auth/deviceFlow.js";
import { getCurrent } from "../auth/tokenStore.js";
import { color, logWarn } from "../util/ui.js";

export async function loginCmd(args: string[]) {
  // 已登录?
  const current = getCurrent();
  if (current && !args.includes("--force")) {
    logWarn(
      `Already signed in as ${color.bold(current.tenant.name)}. ` +
        `Use ${color.cyan("nexra login --force")} to switch.`
    );
    return;
  }

  const labelIdx = args.indexOf("--label");
  const label = labelIdx >= 0 ? args[labelIdx + 1] : undefined;
  const scopeIdx = args.indexOf("--scope");
  const scope = scopeIdx >= 0 ? args[scopeIdx + 1] : undefined;

  await deviceLogin({ label, scope });
}
