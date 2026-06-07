"use client";

import * as React from "react";
import { FHIRAddressInput } from "@/registry/fhir-ui/fhir-address-input";
import { type Address } from "@medplum/fhirtypes";

export function FHIRAddressInputDemo({
  variant = "simple",
  description,
}: {
  variant?: "simple" | "detailed";
  description?: string;
}) {
  const [address, setAddress] = React.useState<Address>({});

  return (
    <div className="w-full space-y-4">
      <FHIRAddressInput 
        variant={variant}
        description={description}
        onChange={setAddress}
      />
      <div className="rounded-lg border bg-muted/30 p-4 font-mono text-xs">
        <div className="font-semibold text-muted-foreground mb-2 flex items-center justify-between">
          <span>onChange Output (FHIR Address Object)</span>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans">JavaScript Object</span>
        </div>
        <pre className="overflow-x-auto text-foreground max-h-[250px] scrollbar-thin">
          {JSON.stringify(address, null, 2)}
        </pre>
      </div>
    </div>
  );
}
