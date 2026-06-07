/**
 * Satusehat Location utilities.
 * For healthcare facility location management (wards, rooms, beds, etc.).
 * @see https://hl7.org/fhir/location.html
 */

import type { LocationItem } from "@/registry/fhir-ui/fhir-location-input/component";

/**
 * Physical types for healthcare locations
 */
export type LocationPhysicalType =
  | "building"
  | "ward"
  | "floor"
  | "room"
  | "bed"
  | "clinic"
  | "department"
  | "icu"
  | "er"
  | "or"
  | "pharmacy";

/**
 * Search filters for location queries
 */
export interface LocationSearchFilters {
  query?: string;
  physicalType?: LocationPhysicalType;
  organizationId?: string;
  parentLocationId?: string;
  activeOnly?: boolean;
  limit?: number;
}

/**
 * Satusehat Location API response structure
 */
export interface SatusehatLocationResponse {
  entry?: Array<{
    resource: {
      id: string;
      name?: string;
      description?: string;
      physicalType?: {
        coding?: Array<{
          system?: string;
          code?: string;
          display?: string;
        }>;
      };
      mode?: "instance" | "kind";
      status?: "active" | "suspended" | "inactive";
      managingOrganization?: {
        reference?: string;
        display?: string;
      };
      partOf?: {
        reference?: string;
        display?: string;
      };
    };
  }>;
  total?: number;
}

/**
 * FHIR Location physical type codes
 */
const PHYSICAL_TYPE_MAPPING: Record<string, LocationPhysicalType> = {
  // Standard FHIR physical type codes
  "bld": "building",
  "wa": "ward",
  "lvl": "floor",
  "ro": "room",
  "bd": "bed",
  "area": "clinic",
  "dept": "department",
  // Custom extensions
  "icu": "icu",
  "er": "er",
  "or": "or",
  "pharmacy": "pharmacy",
};

/**
 * Parses Satusehat API response to LocationItem format
 */
export function parseSatusehatLocation(response: SatusehatLocationResponse): LocationItem[] {
  if (!response.entry) return [];

  return response.entry
    .map((entry): LocationItem | null => {
      const resource = entry.resource;
      if (!resource?.id) return null;

      // Extract physical type
      const physicalTypeCode = resource.physicalType?.coding?.[0]?.code;
      const physicalType = physicalTypeCode
        ? PHYSICAL_TYPE_MAPPING[physicalTypeCode.toLowerCase()]
        : undefined;

      // Extract organization reference
      const orgRef = resource.managingOrganization?.reference;
      const organizationId = orgRef ? orgRef.replace("Organization/", "") : undefined;
      const organizationName = resource.managingOrganization?.display;

      // Extract parent location
      const parentRef = resource.partOf?.reference;
      const parentId = parentRef ? parentRef.replace("Location/", "") : undefined;
      const parentName = resource.partOf?.display;

      return {
        id: resource.id,
        name: resource.name || "Unnamed Location",
        description: resource.description,
        physicalType,
        mode: resource.mode,
        status: resource.status,
        organizationId,
        organizationName,
        parentId,
        parentName,
      };
    })
    .filter((item): item is LocationItem => item !== null);
}

/**
 * Formats location item for display
 */
export function formatLocationDisplay(item: LocationItem): string {
  const parts: string[] = [];

  if (item.name) parts.push(item.name);
  if (item.description) parts.push(`(${item.description})`);
  if (item.organizationName) parts.push(`@ ${item.organizationName}`);
  if (item.parentName) parts.push(`in ${item.parentName}`);

  return parts.join(" ");
}

/**
 * Builds location hierarchy display
 * e.g., "Building A > Floor 3 > ICU > Room 301"
 */
export function formatLocationHierarchy(item: LocationItem, ancestors?: LocationItem[]): string {
  const parts: string[] = [];

  if (ancestors && ancestors.length > 0) {
    parts.push(...ancestors.map((a) => a.name));
  }

  parts.push(item.name);

  return parts.join(" > ");
}

/**
 * Validates location bed name format
 * Typical format: "Bed-{number}" or "{ward}-{bed-number}"
 */
export function validateBedName(name: string): boolean {
  return /^bed(-\d+)$/i.test(name) || /^\d{1,4}[A-Za-z]?$/.test(name);
}

/**
 * Validates room name format
 * Typical format: "Room-{number}" or "{ward}-{room-number}"
 */
export function validateRoomName(name: string): boolean {
  return /^room(-\d+)$/i.test(name) || /^[A-Z]\d{3}$/i.test(name);
}

/**
 * API handler for searching locations via Satusehat API
 * @param filters - Search filters
 * @param accessToken - OAuth access token
 * @returns Promise resolving to location list
 */
export async function searchLocationsWithApi(
  filters: LocationSearchFilters,
  accessToken?: string
): Promise<LocationItem[]> {
  const { query = "", physicalType, organizationId, parentLocationId, activeOnly = true, limit = 50 } = filters;

  // TODO: Implement actual API call when authentication is available
  // GET https://api-satusehat.kemkes.go.id/fhir/Location
  // Query params: name={query}, physical-type={physicalType}, organization={organizationId}, part-of={parentLocationId}, status={activeOnly ? 'active' : undefined}, _count={limit}
  // Headers: Authorization: Bearer {accessToken}

  console.log("Searching locations:", { query, physicalType, organizationId, parentLocationId, activeOnly, limit });

  return [];
}

/**
 * Fetches a single location by ID from Satusehat API
 * @param locationId - The location ID
 * @param accessToken - OAuth access token
 * @returns Promise resolving to location or null
 */
export async function fetchLocationById(
  locationId: string,
  accessToken?: string
): Promise<LocationItem | null> {
  // TODO: Implement actual API call
  // GET https://api-satusehat.kemkes.go.id/fhir/Location/{id}
  // Headers: Authorization: Bearer {accessToken}

  console.log("Fetching location:", locationId);

  return null;
}

/**
 * Mock data for development/testing
 */
export const MOCK_LOCATIONS: LocationItem[] = [
  {
    id: "loc-1",
    name: "IGD",
    description: "Instalasi Gawat Darurat",
    physicalType: "er",
    status: "active",
    organizationId: "1",
    organizationName: "RS UPN Dr. Cipto Mangunkusumo",
  },
  {
    id: "loc-2",
    name: "ICU Floor 3",
    description: "Intensive Care Unit",
    physicalType: "icu",
    status: "active",
    organizationId: "1",
    organizationName: "RS UPN Dr. Cipto Mangunkusumo",
    parentId: "loc-10",
    parentName: "Floor 3",
  },
  {
    id: "loc-3",
    name: "ICU-01",
    description: "Room 1",
    physicalType: "room",
    status: "active",
    organizationId: "1",
    organizationName: "RS UPN Dr. Cipto Mangunkusumo",
    parentId: "loc-2",
    parentName: "ICU Floor 3",
  },
  {
    id: "loc-4",
    name: "Bed-1",
    description: "Tempat Tidur 1",
    physicalType: "bed",
    status: "active",
    organizationId: "1",
    organizationName: "RS UPN Dr. Cipto Mangunkusumo",
    parentId: "loc-3",
    parentName: "ICU-01",
  },
  {
    id: "loc-5",
    name: "Bed-2",
    description: "Tempat Tidur 2",
    physicalType: "bed",
    status: "suspended",
    organizationId: "1",
    organizationName: "RS UPN Dr. Cipto Mangunkusumo",
    parentId: "loc-3",
    parentName: "ICU-01",
  },
  {
    id: "loc-6",
    name: "Poliklinik Penyakit Dalam",
    description: "Klinik Spesialis Penyakit Dalam",
    physicalType: "department",
    status: "active",
    organizationId: "1",
    organizationName: "RS UPN Dr. Cipto Mangunkusumo",
  },
  {
    id: "loc-7",
    name: "OK-1",
    description: "Operating Room 1",
    physicalType: "or",
    status: "active",
    organizationId: "1",
    organizationName: "RS UPN Dr. Cipto Mangunkusumo",
  },
  {
    id: "loc-8",
    name: "Apotek Rawat Inap",
    description: "Apotek Lantai 1",
    physicalType: "pharmacy",
    status: "active",
    organizationId: "1",
    organizationName: "RS UPN Dr. Cipto Mangunkusumo",
  },
  {
    id: "loc-9",
    name: "Ward Melati",
    description: "Ruang Rawat Inap Kelas 1",
    physicalType: "ward",
    status: "active",
    organizationId: "1",
    organizationName: "RS UPN Dr. Cipto Mangunkusumo",
  },
  {
    id: "loc-10",
    name: "Floor 3",
    description: "Lantai 3 Gedung A",
    physicalType: "floor",
    status: "active",
    organizationId: "1",
    organizationName: "RS UPN Dr. Cipto Mangunkusumo",
  },
];

/**
 * Mock search function for development
 */
export async function mockSearchLocations(
  query: string,
  filters?: { physicalType?: LocationPhysicalType; organizationId?: string; parentLocationId?: string; activeOnly?: boolean }
): Promise<LocationItem[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let results = MOCK_LOCATIONS;

  // Filter by query
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter((loc) =>
      loc.name.toLowerCase().includes(lowerQuery) ||
      loc.description?.toLowerCase().includes(lowerQuery)
    );
  }

  // Filter by physical type
  if (filters?.physicalType) {
    results = results.filter((loc) => loc.physicalType === filters.physicalType);
  }

  // Filter by organization
  if (filters?.organizationId) {
    results = results.filter((loc) => loc.organizationId === filters.organizationId);
  }

  // Filter by parent location
  if (filters?.parentLocationId) {
    results = results.filter((loc) => loc.parentId === filters.parentLocationId);
  }

  // Filter by status
  if (filters?.activeOnly) {
    results = results.filter((loc) => loc.status === "active");
  }

  return results;
}
