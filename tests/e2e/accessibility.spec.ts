import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoSeriousAccessibilityViolations(page: Page) {
  // Base UI links labels in effects, so audit the hydrated page rather than the server HTML.
  await page.locator("main[data-hydrated]").waitFor();
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
  const street = page.getByTestId("address-section").getByLabel("Street Address (Alamat Jalan)");
  await street.fill("Jl. Merdeka 10");
  await expect(page.getByTestId("address-output")).toContainText("Jl. Merdeka 10");
  await expect(page.getByTestId("address-output")).toContainText('"country":"ID"');
  await expectNoSeriousAccessibilityViolations(page);
});

test("patient registration blocks invalid input and focuses the first error", async ({ page }) => {
  const section = page.getByTestId("registration-section");
  const name = section.getByLabel("Nama lengkap *");
  await name.fill("");
  await section.getByRole("button", { name: "Simpan pasien" }).click();
  await expect(section.getByRole("alert")).toContainText("Nama lengkap wajib diisi");
  await expect(name).toBeFocused();
  await expect(page.getByTestId("submit-attempts")).toHaveText("0");
  await name.fill("Siti Aminah");
  await expect(section.getByText("Nama lengkap wajib diisi.")).toHaveCount(0);
  await expectNoSeriousAccessibilityViolations(page);
});

test("patient registration assembles and submits a valid FHIR Patient", async ({ page }) => {
  const section = page.getByTestId("registration-section");
  await section.getByRole("button", { name: "Simpan pasien" }).click();

  const output = page.getByTestId("patient-output");
  await expect(output).toContainText('"resourceType":"Patient"');
  await expect(output).toContainText('"text":"Siti Aminah"');
  await expect(output).toContainText('"given":["Siti"]');
  await expect(output).toContainText('"family":"Aminah"');
  await expectNoSeriousAccessibilityViolations(page);
});

test("server failure preserves data and retry succeeds", async ({ page }) => {
  await page.goto("/e2e?registration=failure");
  const section = page.getByTestId("registration-section");
  await section.getByRole("button", { name: "Simpan pasien" }).click();
  await expect(section.getByText("Pengiriman gagal")).toBeVisible();
  await expect(section.getByLabel("Nama lengkap *")).toHaveValue("Siti Aminah");
  await section.getByRole("button", { name: "Coba lagi" }).click();
  await expect(section.getByText("Data pasien berhasil diproses.")).toBeVisible();
  await expect(page.getByTestId("submit-attempts")).toHaveText("2");
});

test("duplicate warning requires an explicit confirmation", async ({ page }) => {
  await page.goto("/e2e?registration=duplicate");
  const section = page.getByTestId("registration-section");
  await section.getByRole("button", { name: "Simpan pasien" }).click();
  await expect(section.getByText("Kemungkinan pasien sudah terdaftar.")).toBeVisible();
  await expect(page.getByTestId("submit-attempts")).toHaveText("0");
  await section.getByRole("button", { name: "Tetap lanjutkan" }).click();
  await expect(page.getByTestId("submit-attempts")).toHaveText("1");
});

test("validator errors map back to their field", async ({ page }) => {
  await page.goto("/e2e?registration=validation-error");
  const section = page.getByTestId("registration-section");
  await section.getByRole("button", { name: "Simpan pasien" }).click();
  await expect(section.getByRole("link", { name: "Nama ditolak oleh validator uji." })).toBeVisible();
  await expect(section.getByLabel("Nama lengkap *")).toBeFocused();
  await expect(page.getByTestId("submit-attempts")).toHaveText("0");
});

test("read-only registration disables editing and submission", async ({ page }) => {
  await page.goto("/e2e?registration=readonly");
  const section = page.getByTestId("registration-section");
  await expect(section.getByLabel("Nama lengkap *")).toBeDisabled();
  await expect(section.getByRole("button", { name: "Simpan pasien" })).toBeDisabled();
  await expectNoSeriousAccessibilityViolations(page);
});
