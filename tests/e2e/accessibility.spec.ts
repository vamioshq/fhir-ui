import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoSeriousAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const blocking = results.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
  expect(blocking, blocking.map((violation) => `${violation.id}: ${violation.help}`).join("\n")).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.goto("/e2e");
});

test("date picker is labelled, keyboard dismissible, and accessible", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Patient Date of Birth" });
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("grid")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expectNoSeriousAccessibilityViolations(page);
});

test("dateTime editing emits an offset-aware value", async ({ page }) => {
  await page.getByRole("button", { name: "Encounter Date and Time" }).click();
  const time = page.locator('input[type="time"]');
  await time.fill("14:45");
  await expect(page.getByTestId("datetime-output")).toContainText("T14:45:00+07:00");
  await expectNoSeriousAccessibilityViolations(page);
});

test("address input has an accessible label and emits a FHIR Address", async ({ page }) => {
  const street = page.getByLabel("Street Address (Alamat Jalan)");
  await street.fill("Jl. Merdeka 10");
  await expect(page.getByTestId("address-output")).toContainText("Jl. Merdeka 10");
  await expect(page.getByTestId("address-output")).toContainText('"country":"ID"');
  await expectNoSeriousAccessibilityViolations(page);
});
