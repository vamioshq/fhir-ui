"use client";

import React, { useState } from "react";
import { FHIRDosageInput } from "@/registry/fhir-ui/fhir-dosage-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { type Dosage } from "@medplum/fhirtypes";

export function FHIRDosageInputDemo() {
  const [dosage, setDosage] = useState<Dosage | undefined>(undefined);
  const [showLabel, setShowLabel] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      <div className="flex items-center gap-2 px-1">
        <Checkbox
          id="demo-show-label-checkbox"
          checked={showLabel}
          onCheckedChange={(checked) => setShowLabel(!!checked)}
        />
        <label
          htmlFor="demo-show-label-checkbox"
          className="text-xs font-medium leading-none select-none cursor-pointer whitespace-nowrap"
        >
          Show Field Labels (<code>showLabel</code>)
        </label>
      </div>

      <FHIRDosageInput
        value={dosage}
        onChange={setDosage}
        showLabel={showLabel}
        className="w-full"
      />

      <div className="w-full p-4 bg-muted/40 rounded-lg overflow-auto max-h-[300px] border border-border">
        <div className="font-semibold text-muted-foreground mb-2 flex items-center justify-between text-xs">
          <span>onChange Output (FHIR Dosage Object)</span>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans">JavaScript Object</span>
        </div>
        <pre className="text-xs text-foreground whitespace-pre-wrap font-mono max-h-[220px] scrollbar-thin overflow-y-auto">
          {dosage
            ? JSON.stringify(dosage, null, 2)
            : "No dosage instructions generated yet. Adjust inputs above."}
        </pre>
      </div>
    </div>
  );
}
