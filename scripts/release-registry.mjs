// Tags a release whose registry items pin their dependencies to the tag itself, so a consumer
// that installs from the tag gets that version all the way down. The branch is left unchanged:
// the tag points at a commit made on a detached HEAD on top of it.
//
// Usage: pnpm registry:release 0.2.0   (bump package.json to 0.2.0 in a normal commit first)
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { RELEASE_TAG_PATTERN, registryBaseUrl } from "./registry-url.mjs";

const root = process.cwd();
const version = (process.argv[2] ?? "").replace(/^v/, "");
const tag = `v${version}`;

function run(command, args, { capture = false, env = process.env, allowFailure = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env,
    encoding: "utf8",
    shell: process.platform === "win32" && command === "pnpm",
    stdio: capture ? "pipe" : "inherit",
  });
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`${command} ${args.join(" ")} failed${result.stderr ? `:\n${result.stderr}` : ""}`);
  }
  return { status: result.status, stdout: (result.stdout ?? "").trim() };
}

function preflight() {
  if (!RELEASE_TAG_PATTERN.test(tag)) throw new Error(`"${version}" is not a semantic version (for example 0.2.0).`);
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  if (pkg.version !== version) {
    throw new Error(`package.json is at ${pkg.version}; commit the bump to ${version} before releasing.`);
  }
  if (run("git", ["status", "--porcelain"], { capture: true }).stdout) {
    throw new Error("The working tree is not clean; commit or stash first.");
  }
  if (run("git", ["tag", "--list", tag], { capture: true }).stdout) throw new Error(`Tag ${tag} already exists.`);
  const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"], { capture: true }).stdout;
  if (branch === "HEAD") throw new Error("HEAD is detached; release from a branch.");
  return branch;
}

let branch;
try {
  branch = preflight();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const baseUrl = registryBaseUrl(tag);
try {
  run("pnpm", ["registry:build"], { env: { ...process.env, REGISTRY_BASE_URL: baseUrl } });
  run("git", ["switch", "--detach"]);
  run("git", ["add", "public/r"]);
  run("git", [
    "commit",
    "--allow-empty",
    "-m",
    `release: ${tag}`,
    "-m",
    `Registry dependencies point at ${baseUrl}.`,
  ]);
  run("git", ["tag", "-a", tag, "-m", `fhir-ui ${tag}`]);
} catch (error) {
  console.error(error.message);
  // Put the branch back exactly as it was; only generated registry files were touched.
  run("git", ["checkout", "--", "public/r"], { allowFailure: true });
  run("git", ["switch", branch], { allowFailure: true });
  process.exit(1);
}
run("git", ["switch", branch]);

console.log(`
Tagged ${tag}; ${branch} is unchanged. Publish with:

  git push origin ${tag}

Consumers pin with:

  ${baseUrl}/r/{name}.json`);
