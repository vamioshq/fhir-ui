"use client";

import React, { useState } from "react";
import { FHIRCitizenshipStatusInput } from "@/registry/fhir-ui/fhir-citizenship-status-input";
import { type Extension } from "@medplum/fhirtypes";
import { Checkbox } from "@/components/ui/checkbox";

export function FHIRCitizenshipStatusInputDemo() {
  const [citizenship, setCitizenship] = useState<Extension | undefined>({
    url: "https://fhir.kemkes.go.id/r4/StructureDefinition/citizenshipStatus",
    valueCode: "WNI",
  });
  const [readOnly, setReadOnly] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      {/* Config Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-xl border border-border/80">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setCitizenship({
                url: "https://fhir.kemkes.go.id/r4/StructureDefinition/citizenshipStatus",
                valueCode: "WNI",
              })
            }
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground"
          >
            WNI Example
          </button>
          <button
            type="button"
            onClick={() =>
              setCitizenship({
                url: "https://fhir.kemkes.go.id/r4/StructureDefinition/citizenshipStatus",
                valueCode: "WNA",
              })
            }
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-muted text-muted-foreground hover:bg-muted/80"
          >
            WNA Example
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="cs-demo-readonly-checkbox"
            checked={readOnly}
            onCheckedChange={(checked) => setReadOnly(!!checked)}
          />
          <label
            htmlFor="cs-demo-readonly-checkbox"
            className="text-xs font-medium leading-none select-none cursor-pointer"
          >
            Read Only
          </label>
        </div>
      </div>

      {/* Component Demo */}
      <div className="p-6 bg-background border border-border rounded-xl space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Citizenship Status Input</h3>
          <p className="text-xs text-muted-foreground">
            Select between WNI (Indonesian Citizen) and WNA (Foreign Citizen) with FHIR Extension output for SATUSEHAT.
          </p>
        </div>
        <FHIRCitizenshipStatusInput
          value={citizenship}
          onChange={setCitizenship}
          readOnly={readOnly}
        />
      </div>

      {/* Output Payload */}
      <div className="w-full p-4 bg-muted/40 rounded-lg overflow-auto max-h-75 border border-border">
        <div className="font-semibold text-muted-foreground mb-2 flex items-center justify-between text-xs">
          <span>onChange Output (FHIR Extension - citizenshipStatus)</span>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans">
            Extension
          </span>
        </div>
        <pre className="text-xs text-foreground whitespace-pre-wrap font-mono max-h-55 scrollbar-thin overflow-y-auto">
          {citizenship
            ? JSON.stringify(citizenship, null, 2)
            : "No citizenship status selected."}
        </pre>
      </div>
    </div>
  );
}
