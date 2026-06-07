/**
 * SATUSEHAT Organization utilities.
 * Supports both FHIR Organization API and MSI (Master Sarana Index) API.
 *
 * FHIR Organization API (FHIR R4 Standard):
 * @see https://satusehat.kemkes.go.id/platform/docs/id/api-catalogue/onboardings/apis/organization/
 * - Endpoint: https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1/Organization
 * - Query params: name (organization name), partof (parent organization ID)
 * - Use for: FHIR-compliant organization data, international interoperability
 *
 * MSI (Master Sarana Index) API (Indonesian Master Data, Non-FHIR):
 * @see https://satusehat.kemkes.go.id/platform/docs/id/master-data/master-sarana-index/rest-api-msi/
 * - Endpoint: https://api-satusehat-stg.dto.kemkes.go.id/masterdata/v1/mastersaranaindex/mastersarana
 * - Query params: limit (required), page (required), jenis_sarana (101-104), nama, kode_provinsi, etc.
 * - Use for: Indonesian healthcare facility master data (35 types)
 */

import type { OrganizationItem } from "@/registry/fhir-ui/fhir-organization-input/component";

// ============================================================================
// Common Types
// ============================================================================

/**
 * Facility types according to SATUSEHAT MSI classification
 */
export type FacilityType =
  | "hospital"
  | "clinic"
  | "puskesmas"
  | "pharmacy"
  | "lab"
  | "doctor-practice"
  | "blood-unit"
  | "optical";

// ============================================================================
// FHIR Organization API Types (FHIR R4 Standard)
// ============================================================================

/**
 * FHIR Bundle response structure for Organization search
 * @see https://hl7.org/fhir/bundle.html
 */
export interface FhirOrganizationResponse {
  resourceType: "Bundle";
  type: "searchset";
  total?: number;
  entry?: Array<{
    fullUrl?: string;
    resource: {
      resourceType: "Organization";
      id: string;
      identifier?: Array<{
        system?: string;
        value?: string;
      }>;
      name?: string;
      type?: Array<{
        coding?: Array<{
          system?: string;
          code?: string;
          display?: string;
        }>;
      }>;
      extension?: Array<{
        url?: string;
        valueCode?: string;
      }>;
    };
    search?: {
      mode?: "match" | "include";
    };
  }>;
}

/**
 * Filters for FHIR Organization API search
 */
export interface FhirOrganizationFilters {
  /** Search by organization name (partial or full) */
  name?: string;
  /** Search by parent organization ID */
  partof?: string;
}

// ============================================================================
// MSI API Types (Indonesian Master Data, Non-FHIR)
// ============================================================================

/**
 * MSI facility type codes (jenis_sarana)
 * @see SATUSEHAT MSI documentation
 */
export const MSI_FACILITY_TYPE_CODES = {
  PRAKTIK_MANDIRI: 101,
  PUSKESMAS: 102,
  KLINIK: 103,
  RUMAH_SAKIT: 104,
} as const;

/**
 * MSI API response structure (custom, non-FHIR)
 * @see https://satusehat.kemkes.go.id/platform/docs/id/master-data/master-sarana-index/rest-api-msi/
 */
export interface MsiOrganizationResponse {
  status_code: number;
  message: string;
  page: number;
  total_page: number;
  data: Array<{
    kode_satusehat: string; // SATUSEHAT code (10 digits)
    kode_sarana: string; // Facility code from source system
    nama: string; // Facility name
    telp?: string; // Phone
    email?: string; // Email
    website?: string; // Website
    longitude?: string | number; // Longitude
    latitude?: string | number; // Latitude
    operasional?: boolean; // Operational status
    alamat?: string; // Address
    provinsi?: {
      kode: string | number;
      nama: string;
      kode_bps?: string;
      kode_lama?: string;
    };
    kabkota?: {
      kode: string | number;
      nama: string;
      kode_bps?: string;
      kode_lama?: string;
    };
    jenis_sarana: {
      kode: string; // "101" | "102" | "103" | "104"
      nama: string;
      nama_alt?: string;
    };
    subjenis?: {
      kode: string;
      nama: string;
      nama_alt?: string;
    };
    kelas_sarana?: {
      kode: string;
      nama: string;
    };
    status_sarana: "draft" | "review" | "verified" | "valid" | "reverified";
    status_aktif: boolean;
  }>;
}

/**
 * Filters for MSI API search
 */
export interface MsiOrganizationFilters {
  /** Required: rows per page (max 2000) */
  limit: number;
  /** Required: page number */
  page: number;
  /** Facility type code: 101=Praktik Mandiri, 102=PUSKESMAS, 103=Klinik, 104=Rumah Sakit */
  jenis_sarana?: number;
  /** Facility name search */
  nama?: string;
  /** SATUSEHAT code (10 digits) */
  kode_satusehat?: string;
  /** Province code (2 digits) */
  kode_provinsi?: string;
  /** Regency/city code (4 digits) */
  kode_kabkota?: string;
  /** District code (6 digits) */
  kode_kecamatan?: string;
  /** Active status: true or false */
  status_aktif?: boolean;
  /** Verification status: draft, verified, valid, reverified */
  status_sarana?: string;
}

// ============================================================================
// FHIR Organization API Functions
// ============================================================================

/**
 * Parses FHIR Organization API response to OrganizationItem format
 */
export function parseFhirOrganization(response: FhirOrganizationResponse): OrganizationItem[] {
  if (!response.entry) return [];

  return response.entry
    .map((entry): OrganizationItem | null => {
      const resource = entry.resource;
      if (!resource?.id) return null;

      // Extract SSFK identifier
      const ssfkIdentifier = resource.identifier?.find(
        (id) => id.system === "https://fhir.kemkes.go.id/id/ssfk"
      );

      // Extract facility type from organization type
      const typeCoding = resource.type?.[0]?.coding?.[0];
      const facilityType = mapFacilityTypeFromCode(typeCoding?.code);

      return {
        id: resource.id,
        name: resource.name || "Unnamed Facility",
        identifier: ssfkIdentifier?.value,
        facilityType,
      };
    })
    .filter((item): item is OrganizationItem => item !== null);
}

/**
 * Searches organizations via FHIR Organization API
 * @param filters - FHIR-specific filters
 * @param accessToken - OAuth access token
 * @returns Promise resolving to organization list
 * @see https://satusehat.kemkes.go.id/platform/docs/id/api-catalogue/onboardings/apis/organization/
 *
 * @example
 * const results = await searchFhirOrganizations(
 *   { name: "RSUP", partof: "10000004" },
 *   accessToken
 * );
 */
export async function searchFhirOrganizations(
  filters: FhirOrganizationFilters,
  accessToken?: string
): Promise<OrganizationItem[]> {
  const { name = "", partof } = filters;

  // TODO: Implement actual API call when authentication is available
  // GET https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1/Organization
  // Query params: name={name}, partof={partof}
  // Headers: Authorization: Bearer {accessToken}

  console.log("Searching FHIR organizations:", { name, partof });

  return [];
}

/**
 * Fetches a single organization by ID via FHIR API
 * @param organizationId - The organization ID (UUID)
 * @param accessToken - OAuth access token
 * @returns Promise resolving to organization or null
 * @see https://satusehat.kemkes.go.id/platform/docs/id/api-catalogue/onboardings/apis/organization/
 */
export async function fetchFhirOrganizationById(
  organizationId: string,
  accessToken?: string
): Promise<OrganizationItem | null> {
  // TODO: Implement actual API call
  // GET https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1/Organization/{id}
  // Headers: Authorization: Bearer {accessToken}

  console.log("Fetching FHIR organization:", organizationId);

  return null;
}

// ============================================================================
// MSI API Functions
// ============================================================================

/**
 * Maps MSI jenis_sarana codes to FacilityType enum
 */
function mapMsiFacilityType(jenisSarana: string): FacilityType | undefined {
  const mapping: Record<string, FacilityType> = {
    "101": "doctor-practice",
    "102": "puskesmas",
    "103": "clinic",
    "104": "hospital",
  };
  return mapping[jenisSarana];
}

/**
 * Parses MSI API response to OrganizationItem format
 */
export function parseMsiOrganization(response: MsiOrganizationResponse): OrganizationItem[] {
  if (!response.data) return [];

  return response.data.map((item): OrganizationItem => {
    const facilityType = mapMsiFacilityType(item.jenis_sarana.kode);

    return {
      id: item.kode_satusehat,
      name: item.nama,
      identifier: item.kode_sarana,
      facilityType,
      part: item.provinsi?.kode?.toString(),
    };
  });
}

/**
 * Searches organizations via MSI API
 * @param filters - MSI-specific filters (requires limit and page)
 * @param accessToken - OAuth access token
 * @returns Promise resolving to organization list
 * @see https://satusehat.kemkes.go.id/platform/docs/id/master-data/master-sarana-index/rest-api-msi/
 *
 * @example
 * const results = await searchMsiOrganizations(
 *   { limit: 10, page: 1, jenis_sarana: 104, nama: "RS" },
 *   accessToken
 * );
 */
export async function searchMsiOrganizations(
  filters: MsiOrganizationFilters,
  accessToken?: string
): Promise<OrganizationItem[]> {
  const { limit, page, jenis_sarana, nama, kode_provinsi, status_aktif } = filters;

  // TODO: Implement actual API call when authentication is available
  // GET https://api-satusehat-stg.dto.kemkes.go.id/masterdata/v1/mastersaranaindex/mastersarana
  // Query params: limit={limit}, page={page}, jenis_sarana={jenis_sarana}, nama={nama}, etc.
  // Headers: Authorization: Bearer {accessToken}

  console.log("Searching MSI organizations:", { limit, page, jenis_sarana, nama, kode_provinsi, status_aktif });

  return [];
}

/**
 * Fetches a single organization by SATUSEHAT code via MSI API
 * @param kodeSatusehat - The SATUSEHAT code (10 digits)
 * @param accessToken - OAuth access token
 * @returns Promise resolving to organization or null
 * @see https://satusehat.kemkes.go.id/platform/docs/id/master-data/master-sarana-index/rest-api-msi/
 */
export async function fetchMsiOrganizationByCode(
  kodeSatusehat: string,
  accessToken?: string
): Promise<OrganizationItem | null> {
  // TODO: Implement actual API call
  // GET https://api-satusehat-stg.dto.kemkes.go.id/masterdata/v1/mastersaranaindex/mastersarana
  // Query params: kode_satusehat={kodeSatusehat}
  // Headers: Authorization: Bearer {accessToken}

  console.log("Fetching MSI organization:", kodeSatusehat);

  return null;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Maps facility type codes to FacilityType enum (generic mapping)
 */
function mapFacilityTypeFromCode(code?: string): FacilityType | undefined {
  if (!code) return undefined;

  const mapping: Record<string, FacilityType> = {
    hospital: "hospital",
    clinic: "clinic",
    puskesmas: "puskesmas",
    pharmacy: "pharmacy",
    laboratory: "lab",
    "doctor-practice": "doctor-practice",
    "blood-unit": "blood-unit",
    optical: "optical",
  };

  return mapping[code.toLowerCase()];
}

/**
 * Formats organization item for display
 */
export function formatOrganizationDisplay(item: OrganizationItem): string {
  const parts: string[] = [];

  if (item.name) parts.push(item.name);
  if (item.facilityType) parts.push(`(${item.facilityType})`);
  if (item.part) parts.push(`[${item.part}]`);

  return parts.join(" ");
}

/**
 * Validates SSFK (Satu Sehat Fasilitas Kesehatan) code format
 * SSFK codes are typically alphanumeric, length varies by facility type
 */
export function validateSsfkCode(code: string): boolean {
  // Basic validation - adjust based on actual SSFK format rules
  return /^[A-Z0-9]{4,20}$/.test(code);
}

// ============================================================================
// Mock Data for Development
// ============================================================================

/**
 * Mock organizations for development/testing
 */
export const MOCK_ORGANIZATIONS: OrganizationItem[] = [
  {
    id: "1",
    name: "RS UPN Dr. Cipto Mangunkusumo",
    identifier: "SSFK0001",
    facilityType: "hospital",
    part: "31", // DKI Jakarta
  },
  {
    id: "2",
    name: "RSUD Dr. Soetomo",
    identifier: "SSFK0002",
    facilityType: "hospital",
    part: "35", // Jawa Timur
  },
  {
    id: "3",
    name: "Klinik Sehat Selalu",
    identifier: "SSFK0003",
    facilityType: "clinic",
    part: "31",
  },
  {
    id: "4",
    name: "Apotek Kimia Farma 123",
    identifier: "SSFK0004",
    facilityType: "pharmacy",
    part: "36", // Jawa Tengah
  },
  {
    id: "5",
    name: "Puskesmas Tebet",
    identifier: "SSFK0005",
    facilityType: "puskesmas",
    part: "31",
  },
];

/**
 * Mock FHIR response structure for testing
 */
export const MOCK_FHIR_RESPONSE: FhirOrganizationResponse = {
  resourceType: "Bundle",
  type: "searchset",
  total: MOCK_ORGANIZATIONS.length,
  entry: MOCK_ORGANIZATIONS.map((org) => ({
    fullUrl: `https://api-satusehat-stg.dto.kemkes.go.id/fhir-r4/v1/Organization/${org.id}`,
    resource: {
      resourceType: "Organization",
      id: org.id,
      name: org.name,
      identifier: org.identifier
        ? [{ system: "https://fhir.kemkes.go.id/id/ssfk", value: org.identifier }]
        : undefined,
      type: org.facilityType
        ? [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/organization-type", code: org.facilityType, display: org.facilityType }] }]
        : undefined,
    },
    search: { mode: "match" },
  })),
};

/**
 * Mock MSI response structure for testing
 */
export const MOCK_MSI_RESPONSE: MsiOrganizationResponse = {
  status_code: 200,
  message: "Success",
  page: 1,
  total_page: 1,
  data: MOCK_ORGANIZATIONS.map((org) => {
    const jenisSaranaMap: Record<FacilityType, string> = {
      hospital: "104",
      clinic: "103",
      puskesmas: "102",
      pharmacy: "103",
      lab: "103",
      "doctor-practice": "101",
      "blood-unit": "104",
      optical: "103",
    };

    return {
      kode_satusehat: org.id,
      kode_sarana: org.identifier || "unknown",
      nama: org.name,
      alamat: "Mock address",
      provinsi: { kode: org.part || "31", nama: "Jawa Barat" },
      jenis_sarana: {
        kode: jenisSaranaMap[(org.facilityType || "clinic") as FacilityType] || "103",
        nama: org.facilityType || "Klinik",
      },
      status_sarana: "valid",
      status_aktif: true,
    };
  }),
};

/**
 * Mock search function for development (generic)
 */
export async function mockSearchOrganizations(
  query: string,
  filters?: { facilityType?: FacilityType; part?: string }
): Promise<OrganizationItem[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let results = MOCK_ORGANIZATIONS;

  // Filter by query
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter((org) =>
      org.name.toLowerCase().includes(lowerQuery) ||
      org.identifier?.toLowerCase().includes(lowerQuery)
    );
  }

  // Filter by facility type
  if (filters?.facilityType) {
    results = results.filter((org) => org.facilityType === filters.facilityType);
  }

  // Filter by part
  if (filters?.part) {
    results = results.filter((org) => org.part === filters.part);
  }

  return results;
}

/**
 * Mock FHIR search function for testing
 */
export async function mockSearchFhirOrganizations(
  filters: FhirOrganizationFilters
): Promise<OrganizationItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let results = [...MOCK_ORGANIZATIONS];

  if (filters.name) {
    const lowerName = filters.name.toLowerCase();
    results = results.filter((org) => org.name.toLowerCase().includes(lowerName));
  }

  return results;
}

/**
 * Mock MSI search function for testing
 */
export async function mockSearchMsiOrganizations(
  filters: MsiOrganizationFilters
): Promise<OrganizationItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  let results = [...MOCK_ORGANIZATIONS];

  if (filters.nama) {
    const lowerName = filters.nama.toLowerCase();
    results = results.filter((org) => org.name.toLowerCase().includes(lowerName));
  }

  if (filters.kode_provinsi) {
    results = results.filter((org) => org.part === filters.kode_provinsi);
  }

  if (filters.status_aktif !== undefined) {
    // All mock data is active
    if (!filters.status_aktif) {
      results = [];
    }
  }

  return results;
}
