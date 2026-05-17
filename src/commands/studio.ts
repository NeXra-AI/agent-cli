// nexra studio <sub> ... — wired to real /api/admin/studio/* endpoints
// (paths from docs/openapi/studio.openapi.yaml).
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { apiFetch, ApiError } from "../auth/client.js";
import { API_BASE } from "../config.js";
import { color, logError, logInfo, logSuccess, sleep, symbols } from "../util/ui.js";

export async function studioCmd(args: string[]) {
  const [sub, ...rest] = args;
  if (!sub || sub === "--help" || sub === "-h") {
    printHelp();
    return;
  }
  switch (sub) {
    case "image":
      return imageCmd(rest);
    case "video":
      return videoCmd(rest);
    case "music":
      return musicCmd(rest);
    case "site":
      return siteCmd(rest);
    case "ppt":
      return pptCmd(rest);
    case "voice":
    case "tts":
      return voiceCmd(rest);
    default:
      logError(`Unknown studio subcommand: ${sub}`);
      printHelp();
      process.exit(1);
  }
}

function printHelp() {
  console.log();
  console.log(color.bold("nexra studio <sub>") + " — AI creative");
  console.log();
  console.log("  " + color.cyan("image") + "   <prompt>     Generate an image (sync)");
  console.log("  " + color.cyan("video") + "   <prompt>     Generate a short video (async)");
  console.log("  " + color.cyan("music") + "   <prompt>     Generate background music (async)");
  console.log("  " + color.cyan("site") + "    <brief>      AI site builder (async)");
  console.log("  " + color.cyan("ppt") + "     <topic>      AI PPT generator (sync outline + slides)");
  console.log("  " + color.cyan("voice") + "   <text>       Text-to-speech (sync)");
  console.log();
  console.log("Examples:");
  console.log('  nexra studio image "a black cat in luxe handbag ad"');
  console.log('  nexra studio video --duration 5 "summer dress beach shoot"');
  console.log('  nexra studio music "uplifting K-pop instrumental, 30s"');
  console.log('  nexra studio voice --voice female-zh "欢迎来到 J.VOGUE"');
  console.log();
}

// ============== image (sync) =================================================
async function imageCmd(args: string[]) {
  let aspect = "1:1";
  let count = 1;
  let preset = "fast";
  let out: string | undefined;
  const prompt: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--aspect") aspect = args[++i];
    else if (a === "--count") count = parseInt(args[++i] || "1", 10);
    else if (a === "--preset" || a === "--model") preset = args[++i];
    else if (a === "--out") out = args[++i];
    else prompt.push(a);
  }
  const promptText = prompt.join(" ").trim();
  if (!promptText) {
    logError('Missing prompt. Example: nexra studio image "a cat"');
    process.exit(1);
  }

  logInfo(`Generating ${color.cyan(String(count))} image${count > 1 ? "s" : ""} (${aspect}, preset=${preset})...`);
  console.log("  Prompt: " + color.gray(promptText));
  console.log();

  try {
    const resp = await apiFetch<any>("/api/admin/studio/image/generate", {
      method: "POST",
      body: { prompt: promptText, aspect_ratio: aspect, n: count, preset },
    });

    const rawList: any[] =
      resp.images || resp.urls || resp.data?.images ||
      (Array.isArray(resp.data) ? resp.data : []) || [];
    const urls = rawList
      .map((x: any) => (typeof x === "string" ? x : x?.url || x?.image_url))
      .filter(Boolean);

    if (urls.length) {
      await downloadResults(urls, out);
      return;
    }

    const taskId = resp.task_id || resp.id || resp.data?.task_id;
    if (taskId) return pollTask(taskId, out);

    logError("Unexpected response:");
    console.log(JSON.stringify(resp, null, 2).slice(0, 600));
    process.exit(1);
  } catch (e) {
    handleErr(e);
  }
}

// ============== video (async via studio task queue) ==========================
async function videoCmd(args: string[]) {
  let aspect = "9:16";
  let frames = 3;
  let copy = "";
  let referenceImage: string | undefined;
  const prompt: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--aspect") aspect = args[++i];
    else if (a === "--frames") frames = parseInt(args[++i] || "3", 10);
    else if (a === "--copy") copy = args[++i];
    else if (a === "--from-image") referenceImage = args[++i];
    else prompt.push(a);
  }
  const promptText = prompt.join(" ").trim();
  if (!promptText && !referenceImage) {
    logError('Missing prompt. Example: nexra studio video "summer dress hero"');
    process.exit(1);
  }

  // i2v if --from-image, else short-video pipeline (theme + copy_text required)
  const endpoint = referenceImage
    ? "/api/admin/studio/i2v/submit"
    : "/api/admin/studio/pipeline/short-video";

  logInfo(`Submitting video task (${aspect}, ${frames} frames) to ${color.gray(endpoint)}...`);
  console.log("  Theme: " + color.gray(promptText));
  console.log();

  try {
    const body: any = referenceImage
      ? { prompt: promptText, image_url: referenceImage, aspect_ratio: aspect }
      : {
          theme: promptText,
          copy_text: copy || promptText,
          aspect_ratio: aspect,
          frames_count: frames,
        };
    const resp = await apiFetch<any>(endpoint, { method: "POST", body });

    const taskId = resp.task_id || resp.id || resp.data?.task_id;
    if (!taskId) {
      // Some endpoints return URLs sync
      const urls = (resp.videos || resp.urls || [])
        .map((x: any) => (typeof x === "string" ? x : x?.url))
        .filter(Boolean);
      if (urls.length) {
        await downloadResults(urls);
        return;
      }
      logError("No task_id and no URLs returned.");
      console.log(JSON.stringify(resp, null, 2).slice(0, 400));
      process.exit(1);
    }

    logSuccess(`Task ${color.cyan(taskId)} submitted.`);
    logInfo("Polling status (video gen takes 30-90s)...");
    await pollTask(taskId);
  } catch (e) {
    handleErr(e);
  }
}

// ============== music ========================================================
async function musicCmd(args: string[]) {
  let duration = 30;
  let lyrics: string | undefined;
  const prompt: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--duration") duration = parseInt(args[++i] || "30", 10);
    else if (a === "--lyrics") lyrics = args[++i];
    else prompt.push(a);
  }
  const promptText = prompt.join(" ").trim();
  if (!promptText && !lyrics) {
    logError('Missing theme. Example: nexra studio music "uplifting K-pop instrumental"');
    process.exit(1);
  }

  logInfo(`Submitting music task (${duration}s)...`);
  console.log("  Theme: " + color.gray(promptText));
  console.log();

  try {
    const body: any = { theme: promptText, duration_seconds: duration };
    if (lyrics) body.prefilled_lyrics = lyrics;
    const resp = await apiFetch<any>("/api/admin/studio/ai-music/submit", {
      method: "POST",
      body,
    });

    const taskId = resp.task_id || resp.id;
    if (taskId) {
      logSuccess(`Task ${color.cyan(taskId)} submitted.`);
      logInfo("Polling (music gen takes 60-180s)...");
      await pollTask(taskId);
    } else {
      const urls = (resp.audio_url ? [resp.audio_url] : resp.urls || [])
        .map((x: any) => (typeof x === "string" ? x : x?.url))
        .filter(Boolean);
      if (urls.length) await downloadResults(urls);
      else {
        console.log(JSON.stringify(resp, null, 2).slice(0, 400));
      }
    }
  } catch (e) {
    handleErr(e);
  }
}

// ============== site builder =================================================
async function siteCmd(args: string[]) {
  let style: string | undefined;
  let company: string | undefined;
  const brief: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--style") style = args[++i];
    else if (a === "--company") company = args[++i];
    else brief.push(a);
  }
  const briefText = brief.join(" ").trim();
  if (!briefText) {
    logError('Missing brief. Example: nexra studio site --company Acme "boutique women\'s wear KL"');
    process.exit(1);
  }
  // Derive company name from first 3-4 words if not given
  const companyName = company || briefText.split(/\s+/).slice(0, 3).join(" ");

  logInfo(`Building site for ${color.cyan(companyName)} (style=${style || "auto"})...`);
  console.log("  Brief: " + color.gray(briefText));
  console.log();

  try {
    const resp = await apiFetch<any>("/api/admin/studio/site-builder/submit", {
      method: "POST",
      body: {
        company_name: companyName,
        brief: briefText,
        brand_description: briefText,
        style_preset: style,
      },
    });

    const taskId = resp.task_id || resp.id;
    if (taskId) {
      logSuccess(`Site task ${color.cyan(taskId)} submitted.`);
      await pollTask(taskId);
    } else {
      logSuccess("Site generated:");
      console.log(JSON.stringify(resp, null, 2).slice(0, 800));
    }
  } catch (e) {
    handleErr(e);
  }
}

// ============== PPT ==========================================================
async function pptCmd(args: string[]) {
  let outlineOnly = false;
  const topic: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--outline-only") outlineOnly = true;
    else topic.push(a);
  }
  const topicText = topic.join(" ").trim();
  if (!topicText) {
    logError('Missing topic. Example: nexra studio ppt "Q1 sales review"');
    process.exit(1);
  }

  logInfo(`Generating PPT for: ${color.gray(topicText)}`);
  try {
    // outline submit is async (returns task_id)
    const oResp = await apiFetch<any>("/api/admin/studio/ai-ppt/outline", {
      method: "POST",
      body: { topic: topicText },
    });
    const outlineTask = oResp.task_id || oResp.id;
    if (outlineTask) {
      logSuccess(`Outline task ${color.cyan(outlineTask)} submitted (~${oResp.estimated_seconds || 30}s).`);
      await pollTask(String(outlineTask));
      if (outlineOnly) return;
      logInfo("Use the web UI to render slides from this outline: /studio/ppt");
    } else {
      console.log(JSON.stringify(oResp, null, 2).slice(0, 800));
    }
  } catch (e) {
    handleErr(e);
  }
}

// ============== voice / TTS ==================================================
async function voiceCmd(args: string[]) {
  let voice = "default";
  let lang = "auto";
  let out: string | undefined;
  const text: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--voice") voice = args[++i];
    else if (a === "--lang") lang = args[++i];
    else if (a === "--out") out = args[++i];
    else text.push(a);
  }
  const textStr = text.join(" ").trim();
  if (!textStr) {
    logError('Missing text. Example: nexra studio voice "Hello world"');
    process.exit(1);
  }

  logInfo(`TTS (voice=${voice}, lang=${lang})...`);
  try {
    const resp = await apiFetch<any>("/api/admin/studio/tts/generate", {
      method: "POST",
      body: { text: textStr, voice, language: lang },
    });
    const url = resp.audio_url || resp.url;
    if (url) {
      await downloadResults([url], out);
    } else {
      console.log(JSON.stringify(resp, null, 2).slice(0, 600));
    }
  } catch (e) {
    handleErr(e);
  }
}

// ============== shared: poll + download ======================================
async function pollTask(taskId: string, outDir?: string) {
  process.stdout.write(color.gray("Waiting on task " + taskId));
  for (let i = 0; i < 120; i++) {
    await sleep(2500);
    process.stdout.write(color.gray("."));
    try {
      const raw = await apiFetch<any>(`/api/admin/studio/tasks/${taskId}`);
      // Server wraps as {ok: true, task: {...}}
      const status = raw.task || raw;
      const s = (status.status || status.state || "").toLowerCase();
      const progress = status.progress;
      if (s === "completed" || s === "succeeded" || s === "done" || s === "success") {
        console.log();
        const urls = collectUrls(status);
        if (urls.length) {
          await downloadResults(urls, outDir);
        } else {
          logSuccess(`Task done (cost RM ${status.cost_myr ?? 0}).`);
          console.log(JSON.stringify(status.output || status.result || status, null, 2).slice(0, 800));
        }
        return;
      }
      if (s === "failed" || s === "error") {
        console.log();
        logError(`Task failed: ${status.error || status.message || "unknown"}`);
        process.exit(1);
      }
      // 每 10 轮显示一次 progress
      if (progress !== undefined && i % 10 === 0 && progress > 0) {
        process.stdout.write(color.gray(`[${progress}%]`));
      }
    } catch (e: any) {
      // 网络毛刺继续轮询; ApiError 401/402 直接抛
      if (e instanceof ApiError && (e.status === 401 || e.status === 402)) {
        console.log();
        handleErr(e);
      }
    }
  }
  console.log();
  logError("Timed out polling. Check status in the web UI: /studio/tasks");
  process.exit(1);
}

function collectUrls(status: any): string[] {
  const candidates: any[] = [];
  // Direct fields on task
  for (const k of ["images", "videos", "audio", "urls", "output", "results", "data"]) {
    const v = status[k];
    if (Array.isArray(v)) candidates.push(...v);
    else if (v && typeof v === "object") candidates.push(v);
    else if (typeof v === "string") candidates.push(v);
  }
  // Common nested locations
  const out = status.output || status.result || {};
  for (const k of ["images", "videos", "audio", "url", "video_url", "audio_url", "image_url",
                    "preview_url", "download_url", "site_url"]) {
    const v = out[k];
    if (Array.isArray(v)) candidates.push(...v);
    else if (typeof v === "string" || (v && typeof v === "object")) candidates.push(v);
  }
  // Top-level direct URLs
  for (const k of ["audio_url", "video_url", "image_url", "url", "site_url", "preview_url"]) {
    if (typeof status[k] === "string") candidates.push(status[k]);
  }
  return candidates
    .map((x) =>
      typeof x === "string"
        ? x
        : x?.url || x?.audio_url || x?.video_url || x?.image_url || x?.preview_url
    )
    .filter(
      (v) => typeof v === "string" && (v.startsWith("/") || v.startsWith("http"))
    ) as string[];
}

async function downloadResults(urls: string[], outDir?: string) {
  if (!urls || urls.length === 0) {
    logError("No URLs returned.");
    process.exit(1);
  }
  const target = outDir || process.cwd();
  console.log();
  logSuccess(`Generated ${urls.length} file${urls.length > 1 ? "s" : ""}:`);
  for (let i = 0; i < urls.length; i++) {
    const absUrl = urls[i].startsWith("http") ? urls[i] : API_BASE + urls[i];
    console.log(`  ${symbols.bullet} ${color.cyan(absUrl)}`);
    try {
      const r = await fetch(absUrl);
      if (!r.ok) {
        console.log(`    ${color.gray("→ HTTP " + r.status + " — skipped")}`);
        continue;
      }
      const buf = Buffer.from(await r.arrayBuffer());
      const ext = absUrl.split(".").pop()?.split("?")[0] || "bin";
      const fname = join(target, `nexra-${Date.now()}-${i}.${ext}`);
      writeFileSync(fname, buf);
      console.log(`    ${color.gray("→ saved " + fname + " (" + buf.length + " bytes)")}`);
    } catch (e) {
      console.log(`    ${color.gray("→ could not download: " + (e as Error).message)}`);
    }
  }
  console.log();
}

function handleErr(e: unknown) {
  console.log();
  if (e instanceof ApiError) {
    if (e.status === 402) {
      logError("Quota exceeded. Top up: https://nexra-ai.co/billing");
    } else if (e.status === 401) {
      logError("Auth expired. Run: nexra login");
    } else {
      logError(`API error ${e.status}: ${JSON.stringify(e.body).slice(0, 300)}`);
    }
  } else {
    logError((e as Error).message);
  }
  process.exit(1);
}
