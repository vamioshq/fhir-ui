import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { RELEASE_TAG_PATTERN, registryBaseUrl } from "./registry-url.mjs";

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

// A release tag's registry points its dependencies at that tag, so check it against the same URL.
function releaseTagAtHead() {
  const result = spawnSync("git", ["tag", "--points-at", "HEAD"], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) return undefined;
  return result.stdout.split(/\r?\n/).find((tag) => RELEASE_TAG_PATTERN.test(tag));
}

const env = { ...process.env };
const releaseTag = env.REGISTRY_BASE_URL ? undefined : releaseTagAtHead();
if (releaseTag) {
  env.REGISTRY_BASE_URL = registryBaseUrl(releaseTag);
  console.log(`HEAD is release ${releaseTag}; checking registry dependencies against ${env.REGISTRY_BASE_URL}.`);
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
    env,
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
