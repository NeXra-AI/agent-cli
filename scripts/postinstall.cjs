#!/usr/bin/env node
// Postinstall — npm 装完默认只说 "changed N packages", 用户不知道装的什么版本。
// 我们手动打个 welcome,显眼地告诉用户装好了 + 下一步该做什么。
// .cjs 因为 package.json type=module 但这里要 require。

const pkg = require('../package.json');
const isTTY = process.stdout.isTTY;
const c = (code, s) => isTTY ? `\x1b[${code}m${s}\x1b[0m` : s;
const bold = (s) => c('1', s);
const dim = (s) => c('2', s);
const cyan = (s) => c('36', s);
const green = (s) => c('32', s);

// Skip noise inside CI / docker / nested npm operations
if (process.env.CI || process.env.NEXRA_SKIP_POSTINSTALL) process.exit(0);

console.log(`
${green('✓')} ${bold(`NeXra Agent CLI v${pkg.version} installed`)}

${bold('Quick start')}
  ${cyan('nexra login')}        Sign in via browser (one-time)
  ${cyan('nexra chat')}         Talk to your agent in the terminal
  ${cyan('nexra daemon')}       Bridge — let Web Agent Console use fs/bash on this Mac
  ${cyan('nexra agents list')}  Pick which agent runs your chat
  ${cyan('nexra help')}          See all commands

${bold('Docs')}     ${dim('https://github.com/NeXra-AI/agent-cli')}
${bold('Pricing')}  ${dim('https://nexra-ai.co/pricing')}
`);
