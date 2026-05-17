// 零依赖 ANSI 着色 + 输出辅助
const isTTY = process.stdout.isTTY;
const c = (code: string) => (s: string) => (isTTY ? `\x1b[${code}m${s}\x1b[0m` : s);

export const color = {
  red: c("31"),
  green: c("32"),
  yellow: c("33"),
  blue: c("34"),
  magenta: c("35"),
  cyan: c("36"),
  gray: c("90"),
  bold: c("1"),
  dim: c("2"),
  underline: c("4"),
};

export const symbols = {
  check: isTTY ? color.green("✓") : "OK",
  cross: isTTY ? color.red("✗") : "FAIL",
  arrow: "→",
  bullet: "•",
  star: "★",
};

export function logSuccess(msg: string) {
  console.log(`${symbols.check} ${msg}`);
}

export function logError(msg: string) {
  console.error(`${symbols.cross} ${color.red(msg)}`);
}

export function logInfo(msg: string) {
  console.log(`${color.cyan("ℹ")} ${msg}`);
}

export function logWarn(msg: string) {
  console.log(`${color.yellow("!")} ${msg}`);
}

export function box(title: string, lines: string[]) {
  const width = Math.max(title.length, ...lines.map((l) => stripAnsi(l).length)) + 4;
  const top = "┌" + "─".repeat(width - 2) + "┐";
  const bot = "└" + "─".repeat(width - 2) + "┘";
  console.log(top);
  console.log("│ " + color.bold(title).padEnd(width - 3 + (color.bold(title).length - title.length)) + "│");
  console.log("├" + "─".repeat(width - 2) + "┤");
  for (const l of lines) {
    const visLen = stripAnsi(l).length;
    console.log("│ " + l + " ".repeat(width - 3 - visLen) + "│");
  }
  console.log(bot);
}

function stripAnsi(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
