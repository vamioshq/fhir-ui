"use client";

import * as React from "react";
import { FHIRHumanNameInput } from "@/registry/fhir-ui/fhir-human-name-input";
import { type HumanName } from "@medplum/fhirtypes";

export function FHIRHumanNameInputDemo({
  variant = "simple",
  description,
}: {
  variant?: "simple" | "detailed";
  description?: string;
}) {
  const [name, setName] = React.useState<HumanName>({});

  return (
    <div className="w-full space-y-4">
      <FHIRHumanNameInput 
        variant={variant}
        description={description}
        onChange={setName}
      />
      <div className="rounded-lg border bg-muted/30 p-4 font-mono text-xs">
        <div className="font-semibold text-muted-foreground mb-2 flex items-center justify-between">
          <span>onChange Output (FHIR HumanName Object)</span>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans">JavaScript Object</span>
        </div>
        <pre className="overflow-x-auto text-foreground max-h-[250px] scrollbar-thin">
          {JSON.stringify(name, null, 2)}
        </pre>
      </div>
    </div>
  );
}
