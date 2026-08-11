import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const publicDirectory = path.join(root, "public");
const fixtureDirectory = path.join(root, "tests", "fixtures", "consumer");
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "fhir-ui-consumer-"));
const consumerDirectory = path.join(temporaryRoot, "consumer");

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? root,
      env: options.env ?? process.env,
      shell: process.platform === "win32",
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });
  });
}

function contentType(filePath) {
  if (filePath.endsWith(".json")) return "application/json; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  return "application/octet-stream";
}

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  const relativePath = pathname.replace(/^\/+/, "");
  const absolutePath = path.resolve(publicDirectory, relativePath);
  const publicRoot = `${path.resolve(publicDirectory)}${path.sep}`;
  if (!absolutePath.startsWith(publicRoot) || !fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    response.writeHead(404).end("Not found");
    return;
  }
  response.writeHead(200, { "content-type": contentType(absolutePath) });
  fs.createReadStream(absolutePath).pipe(response);
});

try {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not determine registry server port");
  const registryBaseUrl = `http://127.0.0.1:${address.port}`;

  await run("pnpm", ["registry:sync"]);
  await run("pnpm", ["registry:build"], {
    env: { ...process.env, REGISTRY_BASE_URL: registryBaseUrl },
  });
  const registry = JSON.parse(fs.readFileSync(path.join(root, "registry.json"), "utf8"));

  fs.cpSync(fixtureDirectory, consumerDirectory, { recursive: true });
  await run("pnpm", ["install", "--ignore-workspace"], { cwd: consumerDirectory });

  const itemUrls = registry.items.map((item) => `${registryBaseUrl}/r/${item.name}.json`);
  await run(
    "pnpm",
    ["dlx", "shadcn@4.10.0", "add", ...itemUrls, "--yes"],
    { cwd: consumerDirectory },
  );

  for (const item of registry.items) {
    for (const file of item.files) {
      const target = path.join("src", file.target ?? file.path);
      if (!fs.existsSync(path.join(consumerDirectory, target))) {
        throw new Error(`${item.name} did not install expected target ${target}`);
      }
    }
  }

  await run("pnpm", ["typecheck"], { cwd: consumerDirectory });
  console.log(`Installed and type-checked ${registry.items.length} registry items in a clean consumer.`);
} finally {
  await new Promise((resolve) => server.close(resolve));
  await run("node", ["scripts/rewrite-registry-dependencies.mjs"]);
  fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
