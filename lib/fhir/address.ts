import type { Address, Extension } from "@medplum/fhirtypes";

export const SATUSEHAT_ADMINISTRATIVE_CODE_URL =
  "https://fhir.kemkes.go.id/r4/StructureDefinition/administrativeCode";
const LEGACY_ADMINISTRATIVE_ADDRESS_URL =
  "https://fhir.kemkes.go.id/r4/StructureDefinition/administrative-address";

export interface SATUSEHATAddressInput {
  line: string[];
  city: string;
  province: string;
  district: string;
  postalCode: string;
  country: string;
  provinceCode: string;
  cityCode: string;
  districtCode: string;
  villageCode: string;
  rt: string;
  rw: string;
}

export function getSATUSEHATAdministrativeCode(
  address: Address | undefined,
  code: string,
): string {
  const extensions = address?.extension ?? [];
  for (const url of [SATUSEHAT_ADMINISTRATIVE_CODE_URL, LEGACY_ADMINISTRATIVE_ADDRESS_URL]) {
    const parent = extensions.find((extension) => extension.url === url);
    const value = parent?.extension?.find((extension) => extension.url === code)?.valueCode;
    if (value) return value;
  }
  return extensions.find((extension) => extension.url === code)?.valueCode ?? "";
}

function paddedNeighbourhoodCode(value: string): string {
  const trimmed = value.trim();
  return trimmed && /^\d+$/.test(trimmed) ? trimmed.padStart(3, "0") : trimmed;
}

export function buildSATUSEHATAddress(input: SATUSEHATAddressInput): Address {
  const country = input.country.trim().toUpperCase() || "ID";
  const isIndonesian = country === "ID";
  const line = input.line.map((value) => value.trim()).filter(Boolean);
  const rt = paddedNeighbourhoodCode(input.rt);
  const rw = paddedNeighbourhoodCode(input.rw);
  const administrativeValues = [
    ["province", input.provinceCode.trim()],
    ["city", input.cityCode.trim()],
    ["district", input.districtCode.trim()],
    ["village", input.villageCode.trim()],
    ["rt", rt],
    ["rw", rw],
  ] as const;
  const nestedExtensions: Extension[] = administrativeValues
    .filter(([, value]) => Boolean(value))
    .map(([url, valueCode]) => ({ url, valueCode }));
  const extension = isIndonesian && nestedExtensions.length
    ? [{ url: SATUSEHAT_ADMINISTRATIVE_CODE_URL, extension: nestedExtensions }]
    : undefined;
  const text = [
    line.join(", "),
    isIndonesian && rt ? `RT ${rt}` : "",
    isIndonesian && rw ? `RW ${rw}` : "",
    input.city.trim(),
    input.province.trim(),
    input.postalCode.trim(),
    country,
  ].filter(Boolean).join(", ");

  return {
    use: "home",
    type: "both",
    line: line.length ? line : undefined,
    city: input.city.trim() || undefined,
    district: input.district.trim() || undefined,
    state: input.province.trim() || undefined,
    postalCode: input.postalCode.trim() || undefined,
    country,
    text: text || undefined,
    extension,
  };
}
