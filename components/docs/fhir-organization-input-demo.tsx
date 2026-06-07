"use client";

import * as React from "react";
import { type Reference } from "@medplum/fhirtypes";
import { FHIROrganizationInput, type OrganizationItem } from "@/registry/fhir-ui/fhir-organization-input";
import { mockSearchOrganizations, MOCK_ORGANIZATIONS } from "@/lib/satusehat-organization";

export function FHIROrganizationInputDemo() {
  const [organization, setOrganization] = React.useState<Reference | undefined>(undefined);
  const [hospital, setHospital] = React.useState<Reference | undefined>(undefined);
  const [clinic, setClinic] = React.useState<Reference | undefined>(undefined);

  // Handler with async search
  const handleSearch = async (
    query: string,
    filters?: { facilityType?: "hospital" | "clinic" | "puskesmas" | "pharmacy" | "lab" | "doctor-practice" | "blood-unit" | "optical"; part?: string }
  ): Promise<OrganizationItem[]> => {
    return await mockSearchOrganizations(query, filters);
  };

  return (
    <div className="flex w-full flex-col gap-8 items-center justify-center min-h-125 p-4">
      <div className="grid gap-6 w-full max-w-md">
        {/* General Organization Search */}
        <FHIROrganizationInput
          value={organization}
          onChange={setOrganization}
          label="Fasilitas Kesehatan (Semua Tipe)"
          description="Cari dan pilih fasilitas kesehatan dari Satusehat."
          placeholder="Ketik nama fasilitas..."
          onSearch={handleSearch}
        />

        {/* Hospital Only */}
        <FHIROrganizationInput
          value={hospital}
          onChange={setHospital}
          label="Rumah Sakit"
          description="Filter khusus rumah sakit."
          placeholder="Ketik nama rumah sakit..."
          facilityType="hospital"
          onSearch={handleSearch}
        />

        {/* Clinic Only */}
        <FHIROrganizationInput
          value={clinic}
          onChange={setClinic}
          label="Klinik"
          description="Filter khusus klinik."
          placeholder="Ketik nama klinik..."
          facilityType="clinic"
          onSearch={handleSearch}
        />
      </div>

      {/* Output Display */}
      <div className="grid gap-4 sm:grid-cols-3 w-full max-w-3xl mt-4">
        {/* General Organization Payload */}
        <div className="p-4 bg-muted/50 rounded-lg overflow-auto border">
          <p className="text-sm font-semibold mb-2">Organization Payload:</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {organization ? JSON.stringify(organization, null, 2) : "No organization selected"}
          </pre>
        </div>

        {/* Hospital Payload */}
        <div className="p-4 bg-muted/50 rounded-lg overflow-auto border">
          <p className="text-sm font-semibold mb-2">Hospital Payload:</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {hospital ? JSON.stringify(hospital, null, 2) : "No hospital selected"}
          </pre>
        </div>

        {/* Clinic Payload */}
        <div className="p-4 bg-muted/50 rounded-lg overflow-auto border">
          <p className="text-sm font-semibold mb-2">Clinic Payload:</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {clinic ? JSON.stringify(clinic, null, 2) : "No clinic selected"}
          </pre>
        </div>
      </div>

      {/* Static Options Example */}
      <div className="w-full max-w-md pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-4">
          Contoh dengan opsi statis (tanpa pencarian):
        </p>
        <FHIROrganizationInput
          label="Pilih dari Daftar"
          options={MOCK_ORGANIZATIONS.slice(0, 3)}
          onChange={(org) => console.log("Selected:", org)}
        />
      </div>
    </div>
  );
}
