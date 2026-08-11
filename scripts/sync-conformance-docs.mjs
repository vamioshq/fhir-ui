import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const catalog = JSON.parse(fs.readFileSync(path.join(root, "lib", "conformance.json"), "utf8"));

for (const component of catalog.components) {
  const filePath = path.join(root, "content", "docs", `${component.slug}.mdx`);
  if (!fs.existsSync(filePath)) continue;
  const source = fs.readFileSync(filePath, "utf8");
  if (source.includes("<ComponentConformanceSummary")) continue;
  const updated = source.replace(
    /^(# .+)$/m,
    `$1\n\n<ComponentConformanceSummary slug="${component.slug}" />`,
  );
  fs.writeFileSync(filePath, updated);
}

console.log("Synced component conformance summaries into documentation.");
