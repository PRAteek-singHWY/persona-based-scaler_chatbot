/**
 * ┌─────────────────────────────────────────────────────────────┐
 * │          Scaler Academy Clone — AI Agent CLI Tool           │
 * │    Assignment 02 | Persona-Based Scaler Chatbot Repo        │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Architecture:
 *   User Prompt → Agent Loop (START → THINK → TOOL → OBSERVE → OUTPUT)
 *
 * LLM Backend: Groq Cloud (llama-3.3-70b-versatile)
 */

import "dotenv/config";
import readline from "readline";
import { OpenAI } from "openai";
import chalk from "chalk";
import ora from "ora";

import {
  writeFile,
  executeCommand,
  readFile,
  createDirectory,
  listFiles,
} from "./tools/fileTools.js";
import { getScalerTemplate } from "./tools/scalerTemplates.js";

// ─── Groq client (OpenAI-compatible) ─────────────────────────────────────────
const client = new OpenAI({
  apiKey:  process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ─── Tool Registry ────────────────────────────────────────────────────────────
const TOOL_MAP = {
  createDirectory,
  writeFile,
  readFile,
  listFiles,
  executeCommand,
  getScalerTemplate,
};

// ─── System Prompt (kept SHORT to avoid Groq token limits) ───────────────────
const SYSTEM_PROMPT = `
You are ScalerBot — an AI agent that clones the Scaler Academy website.
You reason step by step: START → THINK → TOOL → OBSERVE → OUTPUT.
You NEVER write HTML yourself. You use the getScalerTemplate tool to get each section.

TOOLS:
1. getScalerTemplate(section) — returns a pre-built HTML section.
   Valid sections: "styles", "header", "hero", "features", "footer", "scripts"
2. createDirectory(path) — creates a directory.
3. writeFile(path, content) — writes a file.
4. listFiles(path) — lists a directory.
5. executeCommand(cmd) — runs a shell command.

RESPONSE FORMAT — always ONE JSON object:
{ "step": "START",   "content": "..." }
{ "step": "THINK",   "content": "..." }
{ "step": "TOOL",    "tool_name": "...", "tool_args": { ...args } }
{ "step": "OBSERVE", "content": "..." }
{ "step": "OUTPUT",  "content": "..." }

RULES:
- One JSON object per response. Never output two JSON objects.
- Always THINK before calling a TOOL.
- Always wait for OBSERVE after a TOOL before the next step.
- To build the Scaler clone, you MUST:
  1. createDirectory("scaler_clone")
  2. getScalerTemplate for each section: styles, header, hero, features, footer, scripts
  3. writeFile("scaler_clone/index.html") with a full HTML page assembling all sections
  4. OUTPUT a success message with the file path
`.trim();

// ─── Render a step to the terminal ───────────────────────────────────────────
function renderStep(parsed) {
  const icons  = { START: "🚀", THINK: "🧠", TOOL: "🔧", OBSERVE: "👀", OUTPUT: "✅" };
  const colors = {
    START: chalk.cyan, THINK: chalk.yellow,
    TOOL: chalk.magenta, OBSERVE: chalk.blue, OUTPUT: chalk.green,
  };
  const icon  = icons[parsed.step]  || "•";
  const color = colors[parsed.step] || chalk.white;

  console.log();
  console.log(color(`${icon}  [${parsed.step}]`));

  if (parsed.step === "TOOL") {
    console.log(chalk.gray("   Tool : ") + chalk.magentaBright(parsed.tool_name));
    const argsStr = JSON.stringify(parsed.tool_args, null, 2)
      .split("\n").join("\n          ");
    console.log(chalk.gray("   Args : ") + chalk.white(argsStr));
  } else {
    (parsed.content || "").split("\n").forEach(line =>
      console.log(chalk.gray("   ") + color(line)));
  }
}

// ─── Extract first valid JSON object from raw string ─────────────────────────
function parseAgentJSON(raw) {
  const text  = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = text.indexOf("{");
  if (start === -1) throw new Error("No JSON object found");

  let depth = 0, inString = false, escaped = false, end = -1;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escaped)     { escaped = false; continue; }
    if (ch === "\\") { escaped = true;  continue; }
    if (ch === '"')  { inString = !inString; continue; }
    if (inString)    continue;
    if (ch === "{")  depth++;
    if (ch === "}") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) throw new Error("Incomplete JSON object");
  return JSON.parse(text.slice(start, end + 1));
}

// ─── Core Agent Loop ──────────────────────────────────────────────────────────
async function runAgent(userMessage) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user",   content: userMessage   },
  ];

  console.log();
  console.log(chalk.bold.whiteBright("━".repeat(60)));
  console.log(chalk.bold.whiteBright("  ScalerBot Agent Starting…"));
  console.log(chalk.bold.whiteBright("━".repeat(60)));

  const spinner     = ora({ text: "Thinking…", color: "cyan" });
  const MAX_ITER    = 30;
  let   iteration   = 0;

  // Accumulate HTML sections fetched via getScalerTemplate
  const sections = {};

  while (iteration < MAX_ITER) {
    iteration++;
    spinner.start();

    let raw;
    try {
      const response = await client.chat.completions.create({
        model:       "llama-3.3-70b-versatile",
        messages,
        temperature: 0.1,
        max_tokens:  1024,   // intentionally small — agent uses tools, not generation
      });
      raw = response.choices[0].message.content.trim();
    } catch (err) {
      // Rate-limit retry with backoff
      if (err?.status === 429 || (err?.message || "").includes("429")) {
        const wait = Math.min(4000 * iteration, 20000);
        spinner.text = `Rate limited — retrying in ${wait / 1000}s…`;
        await new Promise(r => setTimeout(r, wait));
        iteration--; // don't count this as a real iteration
        continue;
      }
      spinner.fail(chalk.red("Groq API error: " + err.message));
      break;
    }

    spinner.stop();

    let parsed;
    try {
      parsed = parseAgentJSON(raw);
    } catch {
      // Model gave garbage — nudge it back
      messages.push({ role: "assistant", content: raw });
      messages.push({
        role: "user",
        content: JSON.stringify({
          step: "OBSERVE",
          content: "Invalid JSON. Respond with exactly ONE JSON object matching the format.",
        }),
      });
      continue;
    }

    messages.push({ role: "assistant", content: JSON.stringify(parsed) });
    renderStep(parsed);

    // ── TOOL execution ────────────────────────────────────────────────────────
    if (parsed.step === "TOOL") {
      const fn = TOOL_MAP[parsed.tool_name];

      if (!fn) {
        messages.push({
          role: "user",
          content: JSON.stringify({
            step:    "OBSERVE",
            content: `Tool "${parsed.tool_name}" not found. Available: ${Object.keys(TOOL_MAP).join(", ")}`,
          }),
        });
        continue;
      }

      let result;
      try {
        const args = parsed.tool_args;
        result = Array.isArray(args)
          ? await fn(...args)
          : await fn(...Object.values(args));

        // Cache template sections so agent can assemble the full file
        if (parsed.tool_name === "getScalerTemplate") {
          const sectionName = Object.values(args)[0];
          sections[sectionName] = result;
        }
      } catch (e) {
        result = `ERROR: ${e.message}`;
      }

      // Truncate large template results in the message (agent doesn't need to re-read them)
      const resultForModel = parsed.tool_name === "getScalerTemplate"
        ? `✓ Got "${Object.values(parsed.tool_args)[0]}" section (${result.length} chars). Stored.`
        : (typeof result === "string" ? result : JSON.stringify(result));

      const observe = { step: "OBSERVE", content: resultForModel };
      console.log();
      console.log(chalk.blue("👀  [OBSERVE]"));
      console.log(chalk.gray("   ") + chalk.blueBright(observe.content));
      messages.push({ role: "user", content: JSON.stringify(observe) });
      continue;
    }

    // ── OUTPUT — done ─────────────────────────────────────────────────────────
    if (parsed.step === "OUTPUT") {
      console.log();
      console.log(chalk.bold.green("━".repeat(60)));
      console.log(chalk.bold.green("  Agent completed!"));
      console.log(chalk.bold.green("━".repeat(60)));

      // If we have all sections, assemble the final file now
      const needed = ["styles", "header", "hero", "features", "footer", "scripts"];
      const have   = needed.filter(s => sections[s]);
      if (have.length === needed.length) {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Master DSA, System Design, Full Stack & AI Engineering with Scaler Academy." />
  <title>Scaler Academy — Modern Software &amp; AI Engineering</title>
  ${sections.styles}
</head>
<body>
  ${sections.header}
  <main>
    ${sections.hero}
    ${sections.features}
  </main>
  ${sections.footer}
  ${sections.scripts}
</body>
</html>`;
        await writeFile("scaler_clone/index.html", html);
        console.log(chalk.greenBright("\n  ✅ scaler_clone/index.html written successfully!"));
        console.log(chalk.dim("  Open with: open scaler_clone/index.html\n"));
      }
      break;
    }
  }

  if (iteration >= MAX_ITER) {
    console.log(chalk.red("\n⚠  Max iterations reached."));
  }
}

// ─── CLI ─────────────────────────────────────────────────────────────────────
function startCLI() {
  console.clear();
  console.log(chalk.bold.hex("#F15A23")("╔══════════════════════════════════════════════════════════╗"));
  console.log(chalk.bold.hex("#F15A23")("║") + chalk.bold.white("          🤖  ScalerBot — AI Agent CLI Tool              ") + chalk.bold.hex("#F15A23")("║"));
  console.log(chalk.bold.hex("#F15A23")("║") + chalk.gray("   Clone the Scaler Academy website using AI reasoning   ") + chalk.bold.hex("#F15A23")("║"));
  console.log(chalk.bold.hex("#F15A23")("╚══════════════════════════════════════════════════════════╝"));
  console.log();
  console.log(chalk.dim("  Type your instruction and press Enter. Type 'exit' to quit."));
  console.log(chalk.dim('  Try: "Clone the Scaler Academy website into scaler_clone/"'));
  console.log();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = () => {
    rl.question(chalk.bold.hex("#F15A23")("You › "), async (input) => {
      const trimmed = input.trim();
      if (!trimmed) { ask(); return; }
      if (["exit", "quit"].includes(trimmed.toLowerCase())) {
        console.log(chalk.yellow("\n👋  Goodbye!\n"));
        rl.close();
        return;
      }
      try {
        await runAgent(trimmed);
      } catch (err) {
        console.log(chalk.red("\n💥  " + err.message));
      }
      console.log();
      if (!rl.closed) ask();
    });
  };

  ask();
}

startCLI();
