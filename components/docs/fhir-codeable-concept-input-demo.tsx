"use client";

import * as React from "react";
import { type CodeableConcept } from "@medplum/fhirtypes";
import { FHIRCodeableConceptInput } from "@/registry/fhir-ui/fhir-codeable-concept-input";

// Mock data to simulate SATUSEHAT terminology endpoints
const MOCK_DB: CodeableConcept[] = [
  {
    coding: [
      {
        system: "http://hl7.org/fhir/sid/icd-10",
        code: "A00.0",
        display: "Cholera due to Vibrio cholerae 01, biovar cholerae",
      },
    ],
    text: "Cholera due to Vibrio cholerae 01",
  },
  {
    coding: [
      {
        system: "http://hl7.org/fhir/sid/icd-10",
        code: "A00.1",
        display: "Cholera due to Vibrio cholerae 01, biovar eltor",
      },
    ],
    text: "Cholera due to Vibrio cholerae 01, biovar eltor",
  },
  {
    coding: [
      {
        system: "http://hl7.org/fhir/sid/icd-10",
        code: "A00.9",
        display: "Cholera, unspecified",
      },
    ],
    text: "Cholera, unspecified",
  },
  {
    coding: [
      {
        system: "http://sys-ids.kemkes.go.id/kfa",
        code: "93000578",
        display: "Paracetamol 500 mg Tablet",
      },
    ],
    text: "Paracetamol 500 mg Tablet",
  },
  {
    coding: [
      {
        system: "http://loinc.org",
        code: "718-7",
        display: "Hemoglobin [Mass/volume] in Blood",
      },
    ],
    text: "Hemoglobin [Mass/volume] in Blood",
  },
  {
    coding: [
      {
        system: "http://snomed.info/sct",
        code: "386661006",
        display: "Fever (finding)",
      },
    ],
    text: "Fever",
  },
];

export function FHIRCodeableConceptInputDemo({
  preset,
  label,
  description,
}: {
  preset?: "icd10" | "kfa" | "loinc" | "snomed";
  label?: string;
  description?: string;
}) {
  const [value, setValue] = React.useState<CodeableConcept | undefined>(undefined);

  // Simulate an async API call to a terminology server
  const mockSearch = async (query: string, system?: string): Promise<CodeableConcept[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerQuery = query.toLowerCase();
        const results = MOCK_DB.filter((item) => {
          // If a system is locked (e.g., via preset), filter out items not matching the system
          const itemSys = item.coding?.[0]?.system;
          if (system && itemSys !== system) return false;

          const display = item.coding?.[0]?.display?.toLowerCase() || "";
          const code = item.coding?.[0]?.code?.toLowerCase() || "";
          return display.includes(lowerQuery) || code.includes(lowerQuery);
        });
        resolve(results);
      }, 300); // simulate 300ms network latency
    });
  };

  return (
    <div className="flex w-full flex-col gap-6 items-center justify-center min-h-[400px]">
      <FHIRCodeableConceptInput
        preset={preset}
        label={label || (preset ? undefined : "Clinical Concept (SATUSEHAT)")}
        description={
          description || (preset ? undefined : "Search for diagnoses (ICD-10), meds (KFA), or labs (LOINC)")
        }
        value={value}
        onChange={setValue}
        options={preset ? [] : MOCK_DB}
        onSearch={mockSearch}
        placeholder={preset ? undefined : "Try searching 'Cholera', 'Paracetamol'..."}
      />

      <div className="w-full max-w-md p-4 bg-muted/50 rounded-lg overflow-auto">
        <p className="text-sm font-semibold mb-2">Selected Value:</p>
        <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
          {value ? JSON.stringify(value, null, 2) : "No concept selected"}
        </pre>
      </div>
    </div>
  );
}
