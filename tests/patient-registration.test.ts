import assert from "node:assert/strict";
import test from "node:test";
import type { Patient } from "@medplum/fhirtypes";
import { assemblePatient, validatePatientRegistration, valuesFromPatient } from "../registry/fhir-ui/patient-registration-form/patient-registration-validation.ts";

const validValues = {
  name: { use: "official" as const, text: "Siti Aminah", given: ["Siti"], family: "Aminah" },
  birthDate: "1990-05-15",
  gender: "female" as const,
  phone: { system: "phone" as const, use: "mobile" as const, value: "081234567890" },
  address: { use: "home" as const, line: ["Jl. Merdeka 10"], city: "Jakarta", country: "ID" },
};

test("clinic registration requires core demographic and contact fields", () => {
  const issues = validatePatientRegistration({ birthDate: "" }, new Date("2026-08-11T00:00:00Z"));
  assert.deepEqual(issues.map((item) => item.path), ["name", "birthDate", "gender", "telecom", "address", "address"]);
});

test("NIK is optional but must contain 16 digits when supplied", () => {
  assert.equal(validatePatientRegistration(validValues).length, 0);
  const issues = validatePatientRegistration({ ...validValues, identifier: { value: "123" } });
  assert.equal(issues.find((item) => item.code === "invalid-nik")?.path, "identifier");
});

test("birth date rejects invalid and future calendar dates", () => {
  assert.equal(validatePatientRegistration({ ...validValues, birthDate: "2026-02-30" }, new Date("2026-08-11T00:00:00Z"))[0]?.code, "invalid");
  assert.equal(validatePatientRegistration({ ...validValues, birthDate: "2027-01-01" }, new Date("2026-08-11T00:00:00Z"))[0]?.code, "future");
});

test("values round-trip into a FHIR Patient", () => {
  const patient = assemblePatient(validValues);
  assert.equal(patient.resourceType, "Patient");
  assert.equal(patient.telecom?.[0]?.value, "081234567890");
  assert.deepEqual(valuesFromPatient(patient), { ...validValues, identifier: undefined, citizenship: undefined, religion: undefined, maritalStatus: undefined });
});

test("initial Patient selects the phone contact", () => {
  const patient: Patient = { resourceType: "Patient", telecom: [{ system: "email", value: "x@example.test" }, { system: "phone", value: "08123" }] };
  assert.equal(valuesFromPatient(patient).phone?.value, "08123");
});
