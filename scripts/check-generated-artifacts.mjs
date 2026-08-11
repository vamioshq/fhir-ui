import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const trackedRoots = ["registry.json", "public/r", "content/docs"];

function filesUnder(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) return [];
  if (fs.statSync(absolutePath).isFile()) return [relativePath];
  return fs.readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) =>
    filesUnder(path.join(relativePath, entry.name)),
  );
}

function snapshot() {
  return new Map(
    trackedRoots.flatMap(filesUnder).map((filePath) => [
      filePath.replaceAll("\\", "/"),
      fs.readFileSync(path.join(root, filePath), "utf8"),
    ]),
  );
}

const before = snapshot();
const commands = [
  ["pnpm", ["docs:conformance"]],
  ["pnpm", ["registry:sync"]],
  ["pnpm", ["registry:build"]],
];

for (const [command, args] of commands) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: process.env,
    shell: process.platform === "win32",
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const after = snapshot();
const changed = new Set([...before.keys(), ...after.keys()]);
const drift = [...changed].filter((filePath) => before.get(filePath) !== after.get(filePath));
if (drift.length) {
  console.error(`Generated artifacts are stale:\n${drift.map((file) => `- ${file}`).join("\n")}`);
  process.exit(1);
}

console.log("Generated documentation and registry artifacts are current.");
