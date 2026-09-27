import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const registry = JSON.parse(fs.readFileSync(new URL("../registry.json", import.meta.url), "utf8"));
const customNames = new Set<string>(registry.items.map((item: { name: string }) => item.name));
const published = registry.items.map((item: { name: string }) =>
  JSON.parse(fs.readFileSync(new URL(`../public/r/${item.name}.json`, import.meta.url), "utf8")),
);

const customDependencies = published.flatMap((item: { registryDependencies?: string[] }) =>
  (item.registryDependencies ?? []).filter((dependency) => {
    const match = dependency.match(/\/r\/([^/]+)\.json$/);
    return match !== null && customNames.has(match[1]);
  }),
);

test("custom registry dependencies all point at one published base URL", () => {
  const bases = new Set(customDependencies.map((dependency: string) => dependency.replace(/\/r\/[^/]+\.json$/, "")));
  assert.ok(customDependencies.length > 0);
  assert.equal(bases.size, 1, `mixed dependency bases: ${[...bases].join(", ")}`);
});

test("the published base URL is main or a release tag", () => {
  const [base] = new Set(customDependencies.map((dependency: string) => dependency.replace(/\/r\/[^/]+\.json$/, "")));
  assert.match(
    base as string,
    /^https:\/\/raw\.githubusercontent\.com\/vamioshq\/fhir-ui\/(main|v\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?)\/public$/,
  );
});
