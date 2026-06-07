"use client";

import * as React from "react";
import { type Reference } from "@medplum/fhirtypes";
import { FHIRPractitionerInput, type PractitionerItem } from "@/registry/fhir-ui/fhir-practitioner-input";
import { mockSearchPractitioners, MOCK_PRACTITIONERS } from "@/lib/satusehat-practitioner";

export function FHIRPractitionerInputDemo() {
  const [practitioner, setPractitioner] = React.useState<Reference | undefined>(undefined);
  const [specialist, setSpecialist] = React.useState<Reference | undefined>(undefined);
  const [nurse, setNurse] = React.useState<Reference | undefined>(undefined);
  const [obgyn, setObgyn] = React.useState<Reference | undefined>(undefined);

  // Handler with async search
  const handleSearch = async (
    query: string,
    filters?: {
      role?: "doctor" | "specialist" | "dentist" | "nurse" | "midwife" | "pharmacist" | "nutritionist" | "psychologist" | "lab-tech" | "radiographer";
      specialty?: "internal-medicine" | "pediatrics" | "surgery" | "ob-gyn" | "neurology" | "cardiology" | "pulmonology" | "dermatology" | "ophthalmology" | "ENT" | "psychiatry" | "anesthesiology";
      organizationId?: string;
      activeOnly?: boolean;
    }
  ): Promise<PractitionerItem[]> => {
    return await mockSearchPractitioners(query, filters);
  };

  return (
    <div className="flex w-full flex-col gap-8 items-center justify-center min-h-[550px] p-4">
      <div className="grid gap-6 w-full max-w-md">
        {/* General Practitioner Search */}
        <FHIRPractitionerInput
          value={practitioner}
          onChange={setPractitioner}
          label="Tenaga Kesehatan (Semua Tipe)"
          description="Cari dan pilih tenaga kesehatan dari Satusehat."
          placeholder="Ketik nama tenaga kesehatan..."
          onSearch={handleSearch}
        />

        {/* Specialist Only */}
        <FHIRPractitionerInput
          value={specialist}
          onChange={setSpecialist}
          label="Dokter Spesialis"
          description="Filter khusus dokter spesialis."
          placeholder="Ketik nama dokter spesialis..."
          role="specialist"
          onSearch={handleSearch}
        />

        {/* Nurse Only */}
        <FHIRPractitionerInput
          value={nurse}
          onChange={setNurse}
          label="Perawat"
          description="Filter khusus perawat."
          placeholder="Ketik nama perawat..."
          role="nurse"
          onSearch={handleSearch}
        />

        {/* OB-GYN Specialist */}
        <FHIRPractitionerInput
          value={obgyn}
          onChange={setObgyn}
          label="Dokter Spesialis Kandungan"
          description="Filter khusus Sp. Kandungan."
          placeholder="Ketik nama Sp. OG..."
          specialty="ob-gyn"
          onSearch={handleSearch}
        />
      </div>

      {/* Output Display */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 w-full max-w-4xl mt-4">
        {/* Practitioner Payload */}
        <div className="p-4 bg-muted/50 rounded-lg overflow-auto border">
          <p className="text-sm font-semibold mb-2">Practitioner Payload:</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {practitioner ? JSON.stringify(practitioner, null, 2) : "No practitioner selected"}
          </pre>
        </div>

        {/* Specialist Payload */}
        <div className="p-4 bg-muted/50 rounded-lg overflow-auto border">
          <p className="text-sm font-semibold mb-2">Specialist Payload:</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {specialist ? JSON.stringify(specialist, null, 2) : "No specialist selected"}
          </pre>
        </div>

        {/* Nurse Payload */}
        <div className="p-4 bg-muted/50 rounded-lg overflow-auto border">
          <p className="text-sm font-semibold mb-2">Nurse Payload:</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {nurse ? JSON.stringify(nurse, null, 2) : "No nurse selected"}
          </pre>
        </div>

        {/* OB-GYN Payload */}
        <div className="p-4 bg-muted/50 rounded-lg overflow-auto border">
          <p className="text-sm font-semibold mb-2">OB-GYN Payload:</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {obgyn ? JSON.stringify(obgyn, null, 2) : "No OB-GYN selected"}
          </pre>
        </div>
      </div>

      {/* Static Options Example */}
      <div className="w-full max-w-md pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-4">
          Contoh dengan opsi statis (tanpa pencarian):
        </p>
        <FHIRPractitionerInput
          label="Pilih dari Daftar"
          options={MOCK_PRACTITIONERS.slice(0, 4)}
          onChange={(practitioner) => console.log("Selected:", practitioner)}
        />
      </div>

      {/* Organization Filter Example */}
      <div className="w-full max-w-md pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-4">
          Filter berdasarkan organisasi (fasilitas kesehatan):
        </p>
        <FHIRPractitionerInput
          label="Dokter di RSUP Cipto Mangunkusumo"
          placeholder="Cari dokter di RSUP..."
          role="specialist"
          organizationId="1"
          onSearch={handleSearch}
          onChange={(practitioner) => console.log("Selected practitioner:", practitioner)}
        />
      </div>
    </div>
  );
}
