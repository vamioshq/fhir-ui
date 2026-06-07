"use client";

import * as React from "react";
import { type Identifier } from "@medplum/fhirtypes";
import { FHIRIdentifierInput } from "@/registry/fhir-ui/fhir-identifier-input";

export function FHIRIdentifierInputDemo() {
  const [nik, setNik] = React.useState<Identifier | undefined>(undefined);
  const [bpjs, setBpjs] = React.useState<Identifier | undefined>(undefined);
  const [ihs, setIhs] = React.useState<Identifier | undefined>(undefined);

  return (
    <div className="flex w-full flex-col gap-8 items-center justify-center min-h-[450px] p-4">
      <div className="grid gap-6 w-full max-w-md">
        {/* IHS Input */}
        <FHIRIdentifierInput
          preset="ihs"
          value={ihs}
          onChange={setIhs}
          description="SATUSEHAT Patient ID: P0 + 10 digits (e.g., P02478375538)."
        />

        {/* NIK Input */}
        <FHIRIdentifierInput
          preset="nik"
          value={nik}
          onChange={setNik}
          description="Enforces 16-digit numeric validation for KTP."
        />

        {/* BPJS Input */}
        <FHIRIdentifierInput
          preset="bpjs"
          value={bpjs}
          onChange={setBpjs}
          description="Enforces 13-digit numeric validation for BPJS Kesehatan."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3 w-full max-w-3xl mt-4">
        {/* IHS Payload Output */}
        <div className="p-4 bg-muted/50 rounded-lg overflow-auto border">
          <p className="text-sm font-semibold mb-2">IHS Payload:</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {ihs ? JSON.stringify(ihs, null, 2) : "No IHS entered"}
          </pre>
        </div>

        {/* NIK Payload Output */}
        <div className="p-4 bg-muted/50 rounded-lg overflow-auto border">
          <p className="text-sm font-semibold mb-2">NIK Payload:</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {nik ? JSON.stringify(nik, null, 2) : "No NIK entered"}
          </pre>
        </div>

        {/* BPJS Payload Output */}
        <div className="p-4 bg-muted/50 rounded-lg overflow-auto border">
          <p className="text-sm font-semibold mb-2">BPJS Payload:</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {bpjs ? JSON.stringify(bpjs, null, 2) : "No BPJS entered"}
          </pre>
        </div>
      </div>
    </div>
  );
}
