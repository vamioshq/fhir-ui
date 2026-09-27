import fs from "node:fs";
import path from "node:path";
import { packageName } from "./package-name.mjs";

const root = process.cwd();
const registryPath = path.join(root, "registry.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const conformance = JSON.parse(
  fs.readFileSync(path.join(root, "lib", "conformance.json"), "utf8"),
);
const conformanceBySlug = new Map(
  conformance.components.map((component) => [component.slug, component]),
);
const itemNames = new Set(registry.items.map((item) => item.name));

const packageDependencies = new Set([
  "@base-ui/react",
  "@medplum/fhirtypes",
  "date-fns",
  "lucide-react",
]);

function importsFor(files) {
  return files.flatMap(({ path: filePath }) => {
    const source = fs.readFileSync(path.join(root, filePath), "utf8");
    return [...source.matchAll(/from\s+["']([^"']+)["']/g)].map(
      (match) => match[1],
    );
  });
}

function dependencyName(specifier) {
  const registryMatch = specifier.match(
    /^@\/registry\/fhir-ui\/([^/]+)(?:\/.*)?$/,
  );
  if (registryMatch && itemNames.has(registryMatch[1])) return registryMatch[1];

  const uiMatch = specifier.match(/^@\/components\/ui\/([^/]+)$/);
  if (uiMatch) return uiMatch[1];

  return undefined;
}

for (const item of registry.items) {
  const componentConformance = conformanceBySlug.get(item.name);
  if (!componentConformance) throw new Error(`Missing conformance entry for ${item.name}`);
  item.metadata = {
    ...item.metadata,
    conformance: {
      reviewedOn: conformance.reviewedOn,
      target: componentConformance.target,
      maturity: componentConformance.maturity,
      levels: componentConformance.levels,
      integration: componentConformance.integration,
      limitations: componentConformance.limitations,
    },
  };
  for (const file of item.files) {
    if (file.path.endsWith("/component.tsx")) {
      file.target = `components/${item.name}.tsx`;
    } else if (file.path.endsWith("/fhir-odontogram-tooth.tsx")) {
      file.target = "components/lib/fhir-odontogram-tooth.tsx";
    } else if (file.path.endsWith("/patient-registration-validation.ts")) {
      file.target = "components/patient-registration-validation.ts";
    } else {
      file.target = file.path;
    }
  }
  const imports = importsFor(item.files);
  const registryDependencies = [
    ...new Set(imports.map(dependencyName).filter(Boolean)),
  ].sort();
  const dependencies = [
    ...new Set(imports.map(packageName).filter((name) => packageDependencies.has(name))),
  ].sort();

  for (const specifier of imports.filter(
    (value) => value.startsWith("@/lib/") && value !== "@/lib/utils",
  )) {
    const helperPath = `${specifier.slice(2)}.ts`;
    if (!item.files.some((file) => file.path === helperPath)) {
      item.files.push({ path: helperPath, type: "registry:lib" });
    }
  }

  if (registryDependencies.length) item.registryDependencies = registryDependencies;
  else delete item.registryDependencies;

  if (dependencies.length) item.dependencies = dependencies;
  else delete item.dependencies;
}

fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
