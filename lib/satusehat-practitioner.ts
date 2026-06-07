/**
 * Satusehat Practitioner utilities.
 * For healthcare practitioner (Nakes) management.
 * @see https://satusehat.kemkes.go.id/platform/docs/id/fhir/resources/practitioner/
 */

import type { PractitionerItem } from "@/registry/fhir-ui/fhir-practitioner-input/component";

/**
 * Practitioner roles
 */
export type PractitionerRole =
  | "doctor"
  | "specialist"
  | "dentist"
  | "nurse"
  | "midwife"
  | "pharmacist"
  | "nutritionist"
  | "psychologist"
  | "lab-tech"
  | "radiographer";

/**
 * Practitioner specialties
 */
export type PractitionerSpecialty =
  | "internal-medicine"
  | "pediatrics"
  | "surgery"
  | "ob-gyn"
  | "neurology"
  | "cardiology"
  | "pulmonology"
  | "dermatology"
  | "ophthalmology"
  | "ENT"
  | "psychiatry"
  | "anesthesiology";

/**
 * Search filters for practitioner queries
 */
export interface PractitionerSearchFilters {
  query?: string;
  role?: PractitionerRole;
  specialty?: PractitionerSpecialty;
  organizationId?: string;
  activeOnly?: boolean;
  limit?: number;
}

/**
 * Satusehat Practitioner API response structure
 */
export interface SatusehatPractitionerResponse {
  entry?: Array<{
    resource: {
      id: string;
      name?: Array<{
        family?: string;
        given?: string[];
        prefix?: string[];
        suffix?: string[];
      }>;
      identifier?: Array<{
        system?: string;
        value?: string;
      }>;
      gender?: "male" | "female" | "other" | "unknown";
      birthDate?: string;
      qualification?: Array<{
        code?: {
          coding?: Array<{
            system?: string;
            code?: string;
            display?: string;
          }>;
        };
      }>;
      active?: boolean;
    };
  }>;
  total?: number;
}

/**
 * FHIR practitioner role codes
 */
const ROLE_CODE_MAPPING: Record<string, PractitionerRole> = {
  "doctor": "doctor",
  "specialist": "specialist", // Specialist doctor
  "dentist": "dentist",
  "nurse": "nurse",
  "midwife": "midwife",
  "pharmacist": "pharmacist",
  "nutritionist": "nutritionist",
  "psychologist": "psychologist",
  "lab-tech": "lab-tech",
  "radiographer": "radiographer",
};

/**
 * FHIR specialty codes to our mapping
 */
const SPECIALTY_CODE_MAPPING: Record<string, PractitionerSpecialty> = {
  "internal-medicine": "internal-medicine",
  "pediatrics": "pediatrics",
  "surgery": "surgery",
  "ob-gyn": "ob-gyn",
  "neurology": "neurology",
  "cardiology": "cardiology",
  "pulmonology": "pulmonology",
  "dermatology": "dermatology",
  "ophthalmology": "ophthalmology",
  "ent": "ENT",
  "psychiatry": "psychiatry",
  "anesthesiology": "anesthesiology",
};

/**
 * Parses Satusehat API response to PractitionerItem format
 */
export function parseSatusehatPractitioner(response: SatusehatPractitionerResponse): PractitionerItem[] {
  if (!response.entry) return [];

  return response.entry
    .map((entry): PractitionerItem | null => {
      const resource = entry.resource;
      if (!resource?.id) return null;

      // Extract name
      const nameEntry = resource.name?.[0];
      const givenNames = nameEntry?.given?.join(" ") || "";
      const familyName = nameEntry?.family || "";
      const fullName = [givenNames, familyName].filter(Boolean).join(" ") || "Unknown Practitioner";

      // Extract Nakes ID
      const nakesId = resource.identifier?.find(
        (id) => id.system === "https://fhir.kemkes.go.id/id/nakes-his-number"
      )?.value;

      // Extract NIK
      const nik = resource.identifier?.find(
        (id) => id.system === "https://fhir.kemkes.go.id/id/nik"
      )?.value;

      // Extract specialty from qualification
      const qualification = resource.qualification?.[0];
      const specialtyCode = qualification?.code?.coding?.[0]?.code;
      const specialty = specialtyCode ? SPECIALTY_CODE_MAPPING[specialtyCode.toLowerCase()] : undefined;

      // Determine role from specialty
      let role: PractitionerRole | undefined;
      if (specialty) {
        role = "specialist";
      } else {
        // Could be derived from other fields or extensions
        role = undefined;
      }

      return {
        id: resource.id,
        name: fullName,
        nakesId: nakesId,
        nik: nik,
        role,
        specialty,
        gender: resource.gender,
        status: resource.active === false ? "inactive" : "active",
      };
    })
    .filter((item): item is PractitionerItem => item !== null);
}

/**
 * Formats practitioner item for display
 */
export function formatPractitionerDisplay(item: PractitionerItem): string {
  const parts: string[] = [];

  if (item.name) parts.push(item.name);
  if (item.specialty) {
    const specialtyLabels: Record<PractitionerSpecialty, string> = {
      "internal-medicine": "Sp.PD",
      "pediatrics": "Sp.A",
      "surgery": "Sp.B",
      "ob-gyn": "Sp.OG",
      "neurology": "Sp.S",
      "cardiology": "Sp.JP",
      "pulmonology": "Sp.P",
      "dermatology": "Sp.KK",
      "ophthalmology": "Sp.M",
      "ENT": "Sp.THT",
      "psychiatry": "Sp.KJ",
      "anesthesiology": "Sp.A",
    };
    parts.push(`(${specialtyLabels[item.specialty] || item.specialty})`);
  }
  if (item.role) {
    const roleLabels: Record<PractitionerRole, string> = {
      "doctor": "dr.",
      "specialist": "dr. Spesialis",
      "dentist": "drg.",
      "nurse": "perawat",
      "midwife": "bidan",
      "pharmacist": "apt.",
      "nutritionist": "ahli gizi",
      "psychologist": "psikolog",
      "lab-tech": "teknisi lab",
      "radiographer": "radiografer",
    };
    parts.push(roleLabels[item.role] || item.role);
  }

  return parts.join(" ");
}

/**
 * Validates Nakes ID format
 * Format: N + digits (e.g., N10000001)
 */
export function validateNakesId(id: string): boolean {
  return /^N\d+$/.test(id);
}

/**
 * Validates STR (Surat Tanda Registrasi) format
 * Format: 16 alphanumeric characters
 */
export function validateStr(str: string): boolean {
  return /^[a-zA-Z0-9]{16}$/.test(str);
}

/**
 * Validates SIP (Surat Izin Praktik) format
 * Format varies by region
 */
export function validateSip(sip: string): boolean {
  // Basic validation - adjust based on actual SIP format
  return sip.length >= 10 && /^[A-Z0-9/]+$/.test(sip);
}

/**
 * API handler for searching practitioners via Satusehat API
 * @param filters - Search filters
 * @param accessToken - OAuth access token
 * @returns Promise resolving to practitioner list
 */
export async function searchPractitionersWithApi(
  filters: PractitionerSearchFilters,
  accessToken?: string
): Promise<PractitionerItem[]> {
  const { query = "", role, specialty, organizationId, activeOnly = true, limit = 20 } = filters;

  // TODO: Implement actual API call when authentication is available
  // GET https://api-satusehat.kemkes.go.id/fhir/Practitioner
  // Query params: name={query}, role={role}, organization={organizationId}, active={activeOnly}, _count={limit}
  // Headers: Authorization: Bearer {accessToken}

  console.log("Searching practitioners:", { query, role, specialty, organizationId, activeOnly, limit });

  return [];
}

/**
 * Fetches a single practitioner by ID from Satusehat API
 * @param practitionerId - The practitioner ID
 * @param accessToken - OAuth access token
 * @returns Promise resolving to practitioner or null
 */
export async function fetchPractitionerById(
  practitionerId: string,
  accessToken?: string
): Promise<PractitionerItem | null> {
  // TODO: Implement actual API call
  // GET https://api-satusehat.kemkes.go.id/fhir/Practitioner/{id}
  // Headers: Authorization: Bearer {accessToken}

  console.log("Fetching practitioner:", practitionerId);

  return null;
}

/**
 * Mock data for development/testing
 */
export const MOCK_PRACTITIONERS: PractitionerItem[] = [
  {
    id: "pract-1",
    name: "Dr. Budi Santoso",
    nakesId: "N10000001",
    nik: "3201010101800001",
    role: "specialist",
    specialty: "internal-medicine",
    gender: "male",
    status: "active",
    organizationId: "1",
    organizationName: "RS UPN Dr. Cipto Mangunkusumo",
  },
  {
    id: "pract-2",
    name: "Dr. Siti Aminah",
    nakesId: "N10000002",
    nik: "3201010101850002",
    role: "specialist",
    specialty: "pediatrics",
    gender: "female",
    status: "active",
    organizationId: "1",
    organizationName: "RS UPN Dr. Cipto Mangunkusumo",
  },
  {
    id: "pract-3",
    name: "d. Rina Wijaya",
    nakesId: "N10000003",
    nik: "3201010101900003",
    role: "dentist",
    gender: "female",
    status: "active",
    organizationId: "1",
    organizationName: "RS UPN Dr. Cipto Mangunkusumo",
  },
  {
    id: "pract-4",
    name: "Ns. Ahmad Hidayat",
    nakesId: "N20000001",
    nik: "3201010101950004",
    role: "nurse",
    gender: "male",
    status: "active",
    organizationId: "1",
    organizationName: "RS UPN Dr. Cipto Mangunkusumo",
  },
  {
    id: "pract-5",
    name: "Bd. Sri Wahyuni",
    nakesId: "N30000001",
    nik: "3201010101920005",
    role: "midwife",
    gender: "female",
    status: "active",
    organizationId: "2",
    organizationName: "RSUD Dr. Soetomo",
  },
  {
    id: "pract-6",
    name: "Dr. Joko Widodo",
    nakesId: "N10000004",
    nik: "3201010101780006",
    role: "specialist",
    specialty: "surgery",
    gender: "male",
    status: "active",
    organizationId: "2",
    organizationName: "RSUD Dr. Soetomo",
  },
  {
    id: "pract-7",
    name: "apt. Maya Sari",
    nakesId: "N40000001",
    nik: "3201010101930007",
    role: "pharmacist",
    gender: "female",
    status: "suspended",
    organizationId: "1",
    organizationName: "RS UPN Dr. Cipto Mangunkusumo",
  },
  {
    id: "pract-8",
    name: "Dr. Rina Kartika",
    nakesId: "N10000005",
    nik: "3201010101880008",
    role: "specialist",
    specialty: "ob-gyn",
    gender: "female",
    status: "active",
    organizationId: "1",
    organizationName: "RS UPN Dr. Cipto Mangunkusumo",
  },
];

/**
 * Mock search function for development
 */
export async function mockSearchPractitioners(
  query: string,
  filters?: { role?: PractitionerRole; specialty?: PractitionerSpecialty; organizationId?: string; activeOnly?: boolean }
): Promise<PractitionerItem[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let results = MOCK_PRACTITIONERS;

  // Filter by query
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter((practitioner) =>
      practitioner.name.toLowerCase().includes(lowerQuery) ||
      practitioner.nakesId?.toLowerCase().includes(lowerQuery)
    );
  }

  // Filter by role
  if (filters?.role) {
    results = results.filter((p) => p.role === filters.role);
  }

  // Filter by specialty
  if (filters?.specialty) {
    results = results.filter((p) => p.specialty === filters.specialty);
  }

  // Filter by organization
  if (filters?.organizationId) {
    results = results.filter((p) => p.organizationId === filters.organizationId);
  }

  // Filter by status
  if (filters?.activeOnly) {
    results = results.filter((p) => p.status === "active");
  }

  return results;
}
