import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const catalog = JSON.parse(fs.readFileSync(new URL("../lib/conformance.json", import.meta.url), "utf8"));
const registry = JSON.parse(fs.readFileSync(new URL("../registry.json", import.meta.url), "utf8"));

test("every registry item has exactly one conformance entry", () => {
  const registryNames = registry.items.map((item: { name: string }) => item.name).sort();
  const conformanceNames = catalog.components.map((item: { slug: string }) => item.slug).sort();
  assert.deepEqual(conformanceNames, registryNames);
  assert.equal(new Set(conformanceNames).size, conformanceNames.length);
});

test("every component publishes evidence and limitations", () => {
  for (const component of catalog.components) {
    assert.ok(component.target);
    assert.ok(component.maturity);
    assert.ok(component.levels.length > 0);
    assert.ok(component.limitations.length > 0);
  }
});

test("profile validation is never implied without explicit evidence", () => {
  for (const component of catalog.components) {
    if (component.levels.includes("satusehat-profile-validated")) {
      assert.ok(component.profileCanonical);
      assert.ok(component.profileVersion);
      assert.ok(component.tests.length > 0);
    }
  }
});
