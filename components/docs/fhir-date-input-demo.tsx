"use client";

import React, { useState } from "react";
import { FHIRDateInput } from "@/registry/fhir-ui/fhir-date-input";
import { Checkbox } from "@/components/ui/checkbox";

export function FHIRDateInputDemo() {
  const [value, setValue] = useState<string>("1990-05-15");
  const [readOnly, setReadOnly] = useState(false);
  const [showLabel, setShowLabel] = useState(true);

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      {/* Config Row */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 p-4 bg-muted/30 rounded-xl border border-border/80">
        <div></div>

        <div className="flex items-center gap-4 sm:pr-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="date-demo-label-checkbox"
              checked={showLabel}
              onCheckedChange={(checked) => setShowLabel(!!checked)}
            />
            <label
              htmlFor="date-demo-label-checkbox"
              className="text-xs font-medium leading-none select-none cursor-pointer whitespace-nowrap"
            >
              Show Input Label
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="date-demo-readonly-checkbox"
              checked={readOnly}
              onCheckedChange={(checked) => setReadOnly(!!checked)}
            />
            <label
              htmlFor="date-demo-readonly-checkbox"
              className="text-xs font-medium leading-none select-none cursor-pointer whitespace-nowrap"
            >
              Read Only Mode
            </label>
          </div>
        </div>
      </div>

      {/* Render Component */}
      <div className="p-6 bg-background border border-border rounded-xl flex items-center justify-center min-h-[120px]">
        <FHIRDateInput
          value={value}
          onChange={setValue}
          showLabel={showLabel}
          label="Patient Date of Birth"
          readOnly={readOnly}
          className="max-w-[240px]"
        />
      </div>

      {/* Output Payloads */}
      <div className="w-full p-4 bg-muted/40 rounded-lg overflow-auto max-h-[300px] border border-border">
        <div className="font-semibold text-muted-foreground mb-2 flex items-center justify-between text-xs">
          <span>onChange Output (FHIR date String)</span>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans">
            FHIR date (YYYY-MM-DD)
          </span>
        </div>
        <pre className="text-xs text-foreground whitespace-pre-wrap font-mono max-h-[220px] scrollbar-thin overflow-y-auto">
          {value ? JSON.stringify({ value }, null, 2) : "Empty value."}
        </pre>
      </div>
    </div>
  );
}
