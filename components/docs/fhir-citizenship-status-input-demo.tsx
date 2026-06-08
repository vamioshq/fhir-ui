"use client";

import React, { useState } from "react";
import { FHIRCitizenshipStatusInput } from "@/registry/fhir-ui/fhir-citizenship-status-input";
import { type Extension } from "@medplum/fhirtypes";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FHIRCitizenshipStatusInputDemo() {
  const [citizenship, setCitizenship] = useState<Extension | undefined>({
    url: "https://fhir.kemkes.go.id/r4/StructureDefinition/citizenshipStatus",
    valueCode: "WNI",
  });
  const [variant, setVariant] = useState<"toggle" | "select">("toggle");
  const [readOnly, setReadOnly] = useState(false);
  const [showLabel, setShowLabel] = useState(true);

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      {/* Configuration Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 p-4 bg-muted/30 rounded-xl border border-border/80">
        {/* Variant Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Variant Mode
          </label>
          <Select
            value={variant}
            onValueChange={(val) => setVariant(val as "toggle" | "select")}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toggle">Toggle Group</SelectItem>
              <SelectItem value="select">Select Dropdown</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Configurations Checkboxes */}
        <div className="flex items-center gap-4 sm:pr-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="cs-demo-label-checkbox"
              checked={showLabel}
              onCheckedChange={(checked) => setShowLabel(!!checked)}
            />
            <label
              htmlFor="cs-demo-label-checkbox"
              className="text-xs font-medium leading-none select-none cursor-pointer whitespace-nowrap"
            >
              Show Input Label
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="cs-demo-readonly-checkbox"
              checked={readOnly}
              onCheckedChange={(checked) => setReadOnly(!!checked)}
            />
            <label
              htmlFor="cs-demo-readonly-checkbox"
              className="text-xs font-medium leading-none select-none cursor-pointer whitespace-nowrap"
            >
              Read Only Mode
            </label>
          </div>
        </div>
      </div>

      {/* Render Component */}
      <div className="p-6 bg-background border border-border rounded-xl flex items-center justify-center min-h-30 transition-colors">
        <FHIRCitizenshipStatusInput
          value={citizenship}
          onChange={setCitizenship}
          variant={variant}
          showLabel={showLabel}
          readOnly={readOnly}
          className="max-w-md"
        />
      </div>

      {/* Output Payloads */}
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
            : "No citizenship status selected. Choose an option above."}
        </pre>
      </div>
    </div>
  );
}
