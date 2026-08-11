import assert from "node:assert/strict";
import test from "node:test";
import { observationsToVitalSigns, vitalSignsToObservations } from "../lib/fhir/vital-signs.ts";

const context = {
  patientId: "123",
  encounterId: "456",
  effectiveDateTime: "2026-08-10T10:00:00.000Z",
  idFactory: (code: string) => `test-${code}`,
};

test("vital signs serialize with LOINC and UCUM metadata", () => {
  const observations = vitalSignsToObservations({ systolic: 120, diastolic: 80, temperature: 37 }, context);
  const bloodPressure = observations.find((item) => item.code?.coding?.[0]?.code === "85354-9");
  const temperature = observations.find((item) => item.code?.coding?.[0]?.code === "8310-5");
  assert.equal(bloodPressure?.component?.length, 2);
  assert.equal(temperature?.valueQuantity?.system, "http://unitsofmeasure.org");
  assert.equal(temperature?.valueQuantity?.code, "Cel");
  assert.equal(temperature?.subject?.reference, "Patient/123");
});

test("vital signs round-trip and calculate BMI", () => {
  const input = { systolic: 118, diastolic: 76, heartRate: 70, weight: 80, height: 200, waistCircumference: 85 };
  const observations = vitalSignsToObservations(input, context);
  assert.equal(observations.find((item) => item.code?.coding?.[0]?.code === "39156-5")?.valueQuantity?.value, 20);
  assert.deepEqual(observationsToVitalSigns(observations), input);
});

test("zero is retained as a defined measurement", () => {
  const observations = vitalSignsToObservations({ heartRate: 0 }, context);
  assert.equal(observationsToVitalSigns(observations).heartRate, 0);
});
