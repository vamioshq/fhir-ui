"use client";

import * as React from "react";
import { type Reference } from "@medplum/fhirtypes";
import { FHIRReferenceInput } from "@/registry/fhir-ui/fhir-reference-input";

// Mock database simulating SATUSEHAT endpoints
const MOCK_DB: Reference[] = [
  {
    reference: "Patient/P02012345678",
    type: "Patient",
    display: "Budi Santoso",
  },
  {
    reference: "Patient/P09876543210",
    type: "Patient",
    display: "Siti Aminah",
  },
  {
    reference: "Practitioner/N10000001",
    type: "Practitioner",
    display: "Dr. Andi Wijaya, Sp.PD",
  },
  {
    reference: "Practitioner/N20000002",
    type: "Practitioner",
    display: "Dr. Rina Suryani, M.Ked",
  },
  {
    reference: "Location/L30000003",
    type: "Location",
    display: "Poliklinik Penyakit Dalam - RS Sehat Selalu",
  },
];

export function FHIRReferenceInputDemo({
  resourceType,
  label,
  description,
}: {
  resourceType?: string;
  label?: string;
  description?: string;
}) {
  const [value, setValue] = React.useState<Reference | undefined>(undefined);

  // Simulate an async API call to a FHIR server (e.g. searching /Patient?name=budi)
  const mockSearch = async (query: string, type?: string): Promise<Reference[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        const results = MOCK_DB.filter((item) => {
          // If a resourceType is locked, filter out items not matching the type
          if (type && item.type !== type) return false;

          const display = item.display?.toLowerCase() || "";
          const ref = item.reference?.toLowerCase() || "";
          return display.includes(lowerQuery) || ref.includes(lowerQuery);
        });
        resolve(results);
      }, 350); // simulate network latency
    });
  };

  return (
    <div className="flex w-full flex-col gap-6 items-center justify-center min-h-[400px]">
      <FHIRReferenceInput
        resourceType={resourceType}
        label={label || (resourceType ? `Select ${resourceType}` : "Link Resource (SATUSEHAT)")}
        description={
          description || "Search for patients, practitioners, or locations by name or ID"
        }
        value={value}
        onChange={setValue}
        onSearch={mockSearch}
        placeholder={resourceType ? `Search ${resourceType}s...` : "Try 'Budi' or 'Dr. Andi'"}
      />

      <div className="w-full max-w-md p-4 bg-muted/50 rounded-lg overflow-auto">
        <p className="text-sm font-semibold mb-2">Selected Reference:</p>
        <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
          {value ? JSON.stringify(value, null, 2) : "No resource linked"}
        </pre>
      </div>
    </div>
  );
}
