import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = JSON.parse(fs.readFileSync(path.join(root, "registry.json"), "utf8"));
const customItems = new Set(source.items.map((item) => item.name));
const baseUrl = (
  process.env.REGISTRY_BASE_URL
  ?? "https://raw.githubusercontent.com/vamioshq/fhir-ui/main/public"
).replace(/\/$/, "");
const outputDirectory = path.join(root, "public", "r");

for (const item of source.items) {
  const outputPath = path.join(outputDirectory, `${item.name}.json`);
  const output = JSON.parse(fs.readFileSync(outputPath, "utf8"));
  output.registryDependencies = (output.registryDependencies ?? []).map((dependency) => {
    const urlMatch = dependency.match(/\/r\/([^/]+)\.json$/);
    const customName = customItems.has(dependency)
      ? dependency
      : urlMatch && customItems.has(urlMatch[1])
        ? urlMatch[1]
        : undefined;
    return customName ? `${baseUrl}/r/${customName}.json` : dependency;
  });
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
}

console.log(`Rewrote custom registry dependencies for ${baseUrl}.`);
