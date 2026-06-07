/**
 * Satusehat validation utilities for Indonesian healthcare identifiers.
 * Based on official SATUSEHAT FHIR R4 Implementation Guide.
 * @see https://simplifier.net/guide/indonesia-satusehat-ihs-fhir-r4
 */

/**
 * Validates IHS (SATUSEHAT ID) format for patients.
 * Format: P0 + exactly 10 digits (e.g., P02478375538)
 * @param value - The IHS ID to validate
 * @returns true if valid format
 * @example
 * validateIhsId("P02478375538") // true
 * validateIhsId("P0123") // false
 * validateIhsId("p02478375538") // false (case sensitive)
 */
export function validateIhsId(value: string): boolean {
  return /^P0\d{10}$/.test(value);
}

/**
 * Validates BPJS Kesehatan number format.
 * Format: Exactly 13 digits
 * @param value - The BPJS number to validate
 * @returns true if valid format
 * @example
 * validateBpjsNumber("0001260979209") // true
 * validateBpjsNumber("12345") // false
 */
export function validateBpjsNumber(value: string): boolean {
  return /^\d{13}$/.test(value);
}

/**
 * Validates Nakes (SATUSEHAT Practitioner ID) format.
 * Format: N + digits (e.g., N10000001)
 * @param value - The Nakes ID to validate
 * @returns true if valid format
 */
export function validateNakesId(value: string): boolean {
  return /^N\d+$/.test(value);
}

/**
 * Validates NIK (Nomor Induk Kependudukan) format.
 * Format: Exactly 16 digits
 * @param value - The NIK to validate
 * @returns true if valid format
 */
export function validateNik(value: string): boolean {
  return /^\d{16}$/.test(value);
}

/**
 * Validates STR (Surat Tanda Registrasi) format.
 * Format: 16 alphanumeric characters
 * @param value - The STR to validate
 * @returns true if valid format
 */
export function validateStr(value: string): boolean {
  return /^[a-zA-Z0-9]{16}$/.test(value);
}

/**
 * Formats IHS ID for display/input.
 * Ensures uppercase P0 and limits to 12 characters.
 * @param value - The IHS ID to format
 * @returns Formatted IHS ID
 */
export function formatIhsId(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^P0\d]/g, "")
    .slice(0, 12);
}

/**
 * Formats BPJS number for display/input.
 * Removes non-digit characters and limits to 13 digits.
 * @param value - The BPJS number to format
 * @returns Formatted BPJS number
 */
export function formatBpjsNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 13);
}

/**
 * Formats NIK for display/input.
 * Removes non-digit characters and limits to 16 digits.
 * @param value - The NIK to format
 * @returns Formatted NIK
 */
export function formatNik(value: string): string {
  return value.replace(/\D/g, "").slice(0, 16);
}

/**
 * API validation hook for IHS ID.
 * Validates against SATUSEHAT API to check if the IHS ID exists.
 * @param value - The IHS ID to validate
 * @param accessToken - Optional OAuth access token for SATUSEHAT API
 * @returns Promise that resolves to true if valid
 * @example
 * const isValid = await validateIhsWithApi("P02478375538", "your-token");
 */
export async function validateIhsWithApi(
  value: string,
  accessToken?: string
): Promise<boolean> {
  if (!validateIhsId(value)) return false;

  // TODO: Implement actual API call when authentication is available
  // GET https://api-satusehat.kemkes.go.id/kfa/v1/patient/{ihs-number}
  // Headers: Authorization: Bearer {accessToken}

  // Placeholder implementation
  return true;
}

/**
 * API validation hook for BPJS number.
 * Validates against BPJS API to check if the number is valid.
 * @param value - The BPJS number to validate
 * @param accessToken - Optional access token for BPJS API
 * @returns Promise that resolves to true if valid
 */
export async function validateBpjsWithApi(
  value: string,
  accessToken?: string
): Promise<boolean> {
  if (!validateBpjsNumber(value)) return false;

  // TODO: Implement actual API call when authentication is available
  // BPJS API endpoint to be determined

  // Placeholder implementation
  return true;
}
