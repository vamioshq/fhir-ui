import assert from "node:assert/strict";
import test from "node:test";
import { formatFHIRDateTime, isFHIRDate, parseFHIRDateTime } from "../lib/fhir/date.ts";

test("FHIR date validation rejects calendar overflow", () => {
  assert.equal(isFHIRDate("2024-02-29"), true);
  assert.equal(isFHIRDate("2023-02-29"), false);
  assert.equal(isFHIRDate("2026-02-31"), false);
  assert.equal(isFHIRDate("2026-13-01"), false);
});

test("FHIR dateTime parsing requires a timezone and valid clock", () => {
  assert.deepEqual(parseFHIRDateTime("2026-06-05T02:35:00+07:00"), {
    date: "2026-06-05",
    time: "02:35",
    offset: "+07:00",
  });
  assert.equal(parseFHIRDateTime("2026-06-05T25:00:00+07:00").date, "");
  assert.equal(parseFHIRDateTime("2026-06-05T02:35:00").date, "");
});

test("FHIR dateTime state formats deterministically", () => {
  assert.equal(formatFHIRDateTime({ date: "2026-06-05", time: "02:35", offset: "+07:00" }), "2026-06-05T02:35:00+07:00");
  assert.equal(formatFHIRDateTime({ date: "2026-02-31", time: "02:35", offset: "+07:00" }), "");
});
