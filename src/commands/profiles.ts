// nexra profiles {list,use,remove} — multi-tenant on one machine.
// Profiles are stored in ~/.nexra/credentials.json. NEXRA_PROFILE env or
// `nexra --profile <name>` selects which one to use.
import { readAll, writeAll } from "../auth/tokenStore.js";
import { color, logError, logInfo, logSuccess, symbols } from "../util/ui.js";
import { getCurrentProfile } from "../config.js";

export async function profilesCmd(args: string[]) {
  const [sub, ...rest] = args;
  switch (sub) {
    case undefined:
    case "list":
      return list();
    case "use":
      return use(rest[0]);
    case "remove":
    case "rm":
      return remove(rest[0]);
    case "--help":
    case "-h":
      return help();
    default:
      logError(`Unknown profiles subcommand: ${sub}`);
      help();
      process.exit(1);
  }
}

function help() {
  console.log();
  console.log(color.bold("nexra profiles") + " — multi-tenant profile management");
  console.log();
  console.log("  " + color.cyan("list") + "              Show all profiles (default)");
  console.log("  " + color.cyan("use") + " <name>        Set default profile");
  console.log("  " + color.cyan("remove") + " <name>     Delete a profile");
  console.log();
  console.log("Add a profile with: " + color.cyan("nexra login --profile <name>"));
  console.log("Or set " + color.cyan("NEXRA_PROFILE=acme") + " env var per command.");
  console.log();
}

function list() {
  const all = readAll();
  const names = Object.keys(all.profiles);
  if (names.length === 0) {
    logInfo("No profiles. Run: nexra login");
    return;
  }
  console.log();
  for (const n of names) {
    const p = all.profiles[n];
    const isDefault = n === all.default_profile;
    const isCurrent = n === getCurrentProfile();
    const tag = isCurrent
      ? color.green(" [current]")
      : isDefault
        ? color.gray(" [default]")
        : "";
    console.log(
      `  ${isCurrent ? symbols.arrow : " "} ${color.cyan(n.padEnd(16))} ` +
        `${p.tenant.name.padEnd(20)} ${color.gray(p.tenant.plan)}${tag}`
    );
  }
  console.log();
}

function use(name?: string) {
  if (!name) {
    logError("Usage: nexra profiles use <name>");
    process.exit(1);
  }
  const all = readAll();
  if (!all.profiles[name]) {
    logError(`Profile '${name}' not found. Run \`nexra profiles list\`.`);
    process.exit(1);
  }
  all.default_profile = name;
  writeAll(all);
  logSuccess(
    `Default profile is now ${color.cyan(name)} (${all.profiles[name].tenant.name}).`
  );
  logInfo("Future commands without NEXRA_PROFILE env will use this profile.");
}

function remove(name?: string) {
  if (!name) {
    logError("Usage: nexra profiles remove <name>");
    process.exit(1);
  }
  const all = readAll();
  if (!all.profiles[name]) {
    logError(`Profile '${name}' not found.`);
    process.exit(1);
  }
  delete all.profiles[name];
  if (all.default_profile === name) {
    all.default_profile = Object.keys(all.profiles)[0] || "default";
  }
  writeAll(all);
  logSuccess(`Removed profile ${color.cyan(name)}.`);
}
