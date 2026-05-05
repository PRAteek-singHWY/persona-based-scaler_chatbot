/**
 * fileTools.js
 * ─────────────────────────────────────────────────────────
 * All tools available to the ScalerBot agent.
 * Each tool returns a human-readable string result so the
 * agent can use it in its OBSERVE reasoning step.
 */

import fs   from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// ─── createDirectory ──────────────────────────────────────
/**
 * Creates a directory (recursively).
 * @param {string} dirPath - Relative or absolute path to create.
 */
export async function createDirectory(dirPath) {
  try {
    const resolved = path.resolve(dirPath);
    await fs.mkdir(resolved, { recursive: true });
    return `✓ Directory created: ${resolved}`;
  } catch (err) {
    return `✗ Failed to create directory "${dirPath}": ${err.message}`;
  }
}

// ─── writeFile ────────────────────────────────────────────
/**
 * Writes (or overwrites) a file with the given content.
 * Automatically creates parent directories.
 * @param {string} filePath - Relative or absolute path.
 * @param {string} content  - File content as a string.
 */
export async function writeFile(filePath, content) {
  try {
    const resolved = path.resolve(filePath);
    await fs.mkdir(path.dirname(resolved), { recursive: true });
    await fs.writeFile(resolved, content, "utf8");
    const size = Buffer.byteLength(content, "utf8");
    return `✓ File written: ${resolved} (${size} bytes)`;
  } catch (err) {
    return `✗ Failed to write file "${filePath}": ${err.message}`;
  }
}

// ─── readFile ─────────────────────────────────────────────
/**
 * Reads and returns the contents of a file.
 * @param {string} filePath - Relative or absolute path.
 */
export async function readFile(filePath) {
  try {
    const resolved = path.resolve(filePath);
    const content  = await fs.readFile(resolved, "utf8");
    return content.slice(0, 4000); // Cap to avoid token explosion
  } catch (err) {
    return `✗ Failed to read file "${filePath}": ${err.message}`;
  }
}

// ─── listFiles ────────────────────────────────────────────
/**
 * Lists files and subdirectories inside a given path.
 * @param {string} dirPath - Relative or absolute path.
 */
export async function listFiles(dirPath) {
  try {
    const resolved = path.resolve(dirPath || ".");
    const entries  = await fs.readdir(resolved, { withFileTypes: true });
    const lines    = entries.map(e => (e.isDirectory() ? `[DIR]  ${e.name}` : `[FILE] ${e.name}`));
    return `Contents of ${resolved}:\n${lines.join("\n")}`;
  } catch (err) {
    return `✗ Failed to list files at "${dirPath}": ${err.message}`;
  }
}

// ─── executeCommand ───────────────────────────────────────
/**
 * Executes a shell command and returns stdout + stderr.
 * @param {string} cmd - The shell command to run.
 */
export async function executeCommand(cmd) {
  // Safety: block destructive commands
  const blocked = ["rm -rf /", "sudo rm", ":(){ :|:& };:"];
  if (blocked.some(b => cmd.includes(b))) {
    return `✗ Blocked dangerous command: "${cmd}"`;
  }

  try {
    const { stdout, stderr } = await execAsync(cmd, {
      timeout: 30_000,   // 30 s
      shell:   true,
    });
    const out = (stdout || "").trim();
    const err = (stderr || "").trim();
    if (out || err) {
      return [out, err].filter(Boolean).join("\n").slice(0, 2000);
    }
    return `✓ Command executed: ${cmd}`;
  } catch (err) {
    return `✗ Command failed: ${err.message}`;
  }
}
