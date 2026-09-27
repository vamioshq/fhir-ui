import fs from "node:fs";
import path from "node:path";
import { packageName } from "./package-name.mjs";

const root = process.cwd();
const registry = JSON.parse(fs.readFileSync(path.join(root, "registry.json"), "utf8"));
const itemNames = new Set(registry.items.map((item) => item.name));
const conformance = JSON.parse(
  fs.readFileSync(path.join(root, "lib", "conformance.json"), "utf8"),
);
const conformanceSlugs = new Set(conformance.components.map((component) => component.slug));
const errors = [];
for (const slug of conformanceSlugs) {
  if (!itemNames.has(slug)) errors.push(`conformance: unknown registry item ${slug}`);
}

for (const item of registry.items) {
  if (!conformanceSlugs.has(item.name)) errors.push(`${item.name}: missing conformance entry`);
  if (!item.metadata?.conformance) errors.push(`${item.name}: conformance metadata not synced`);
  const shippedFiles = new Set(item.files.map((file) => file.path));
  const declaredRegistryDependencies = new Set(item.registryDependencies ?? []);
  const declaredDependencies = new Set(item.dependencies ?? []);

  for (const { path: filePath } of item.files) {
    const absolutePath = path.join(root, filePath);
    if (!fs.existsSync(absolutePath)) {
      errors.push(`${item.name}: missing file ${filePath}`);
      continue;
    }

    const source = fs.readFileSync(absolutePath, "utf8");
    for (const match of source.matchAll(/from\s+["']([^"']+)["']/g)) {
      const specifier = match[1];
      const uiMatch = specifier.match(/^@\/components\/ui\/([^/]+)$/);
      const itemMatch = specifier.match(/^@\/registry\/fhir-ui\/([^/]+)/);

      if (uiMatch && !declaredRegistryDependencies.has(uiMatch[1])) {
        errors.push(`${item.name}: undeclared shadcn dependency ${uiMatch[1]}`);
      } else if (
        itemMatch &&
        itemNames.has(itemMatch[1]) &&
        !declaredRegistryDependencies.has(itemMatch[1])
      ) {
        errors.push(`${item.name}: undeclared registry dependency ${itemMatch[1]}`);
      } else if (specifier.startsWith("@/lib/") && specifier !== "@/lib/utils") {
        const localPath = `${specifier.slice(2)}.ts`;
        if (!shippedFiles.has(localPath)) {
          errors.push(`${item.name}: local import ${specifier} is not shipped`);
        }
      } else if (
        !specifier.startsWith("@/") &&
        !specifier.startsWith("./") &&
        specifier !== "react" &&
        !declaredDependencies.has(packageName(specifier))
      ) {
        errors.push(`${item.name}: undeclared package dependency ${specifier}`);
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Audited ${registry.items.length} registry items successfully.`);
