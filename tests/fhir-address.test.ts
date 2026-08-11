import assert from "node:assert/strict";
import test from "node:test";
import { buildSATUSEHATAddress, getSATUSEHATAdministrativeCode } from "../lib/fhir/address.ts";

test("Indonesian addresses emit nested SATUSEHAT administrative codes", () => {
  const address = buildSATUSEHATAddress({
    line: [" Jalan Merdeka 1 "], city: "Jakarta", province: "DKI Jakarta", district: "Gambir",
    postalCode: "10110", country: "id", provinceCode: "31", cityCode: "3171",
    districtCode: "317101", villageCode: "3171011001", rt: "5", rw: "12",
  });
  assert.equal(address.country, "ID");
  assert.equal(getSATUSEHATAdministrativeCode(address, "rt"), "005");
  assert.equal(getSATUSEHATAdministrativeCode(address, "rw"), "012");
  assert.equal(getSATUSEHATAdministrativeCode(address, "village"), "3171011001");
});

test("international addresses do not emit Indonesian extensions", () => {
  const address = buildSATUSEHATAddress({
    line: ["1 Main St"], city: "Singapore", province: "", district: "", postalCode: "018956",
    country: "SG", provinceCode: "31", cityCode: "", districtCode: "", villageCode: "", rt: "5", rw: "",
  });
  assert.equal(address.country, "SG");
  assert.equal(address.extension, undefined);
  assert.equal(address.text?.includes("RT"), false);
});
