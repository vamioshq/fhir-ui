"use client";

import React, { useState } from "react";
import { FHIRCountrySelector, type CountryItem } from "@/registry/fhir-ui/fhir-country-selector";
import { Checkbox } from "@/components/ui/checkbox";

export function FHIRCountrySelectorDemo() {
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string } | undefined>({ code: "ID", name: "Indonesia" });
  const [readOnly, setReadOnly] = useState(false);

  const handleChange = (code: string, name: string) => {
    setSelectedCountry({ code, name });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      {/* Configuration Panel */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/80">
        <div className="flex items-center gap-2">
          <Checkbox
            id="country-demo-readonly-checkbox"
            checked={readOnly}
            onCheckedChange={(checked) => setReadOnly(!!checked)}
          />
          <label
            htmlFor="country-demo-readonly-checkbox"
            className="text-xs font-medium leading-none select-none cursor-pointer"
          >
            Read Only Mode
          </label>
        </div>
      </div>

      {/* Render Component */}
      <div className="p-6 bg-background border border-border rounded-xl flex items-center justify-center min-h-30">
        <FHIRCountrySelector
          valueCode={selectedCountry?.code}
          onChange={handleChange}
          disabled={readOnly}
          className="max-w-md"
        />
      </div>

      {/* Output Payloads */}
      <div className="w-full p-4 bg-muted/40 rounded-lg overflow-auto max-h-50 border border-border">
        <div className="font-semibold text-muted-foreground mb-2 flex items-center justify-between text-xs">
          <span>onChange Output (Country Code & Name)</span>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans">
            ISO-3166-1 alpha-2
          </span>
        </div>
        <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
          {selectedCountry
            ? JSON.stringify(selectedCountry, null, 2)
            : "No country selected. Choose a country above."}
        </pre>
      </div>
    </div>
  );
}
