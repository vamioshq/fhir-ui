"use client";

import React, { useState } from "react";
import { FHIROdontogramInput } from "@/registry/fhir-ui/fhir-odontogram-input";

export function FHIROdontogramInputDemo() {
  const [resources, setResources] = useState<any[]>([]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl min-h-[600px]">
      <div>
        <h3 className="text-lg font-semibold">Odontogram (Rekam Medis Gigi)</h3>
        <p className="text-sm text-muted-foreground">
          Select a tool and click on a tooth to add a condition or procedure.
        </p>
      </div>

      <FHIROdontogramInput
        value={resources}
        onChange={setResources}
        className="w-full"
      />

      <div className="w-full p-4 bg-muted/50 rounded-lg overflow-auto max-h-[300px]">
        <p className="text-sm font-semibold mb-2">
          Generated FHIR Resources ({resources.length}):
        </p>
        <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
          {resources.length > 0
            ? JSON.stringify(resources, null, 2)
            : "No records added yet. Click on the chart to generate FHIR Resources."}
        </pre>
      </div>
    </div>
  );
}
