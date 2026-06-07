"use client";

import * as React from "react";
import { FHIRMoneyInput } from "@/registry/fhir-ui/fhir-money-input";
import { type Money } from "@medplum/fhirtypes";

export function FHIRMoneyInputDemo() {
  const [money, setMoney] = React.useState<Money>({
    value: 150000,
    currency: "IDR",
  });

  return (
    <div className="w-full space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FHIRMoneyInput
          label="Registration Fee"
          description="Standard outpatient admission fee"
          value={money}
          onChange={setMoney}
        />
        
        <FHIRMoneyInput
          label="Consultation Fee (Read-only)"
          description="Fixed practitioner session rate"
          value={{ value: 250000, currency: "IDR" }}
          readOnly
        />
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 font-mono text-xs">
        <div className="font-semibold text-muted-foreground mb-2 flex items-center justify-between">
          <span>onChange Output (FHIR Money Object)</span>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans">JavaScript Object</span>
        </div>
        <pre className="overflow-x-auto text-foreground max-h-[200px] scrollbar-thin">
          {JSON.stringify(money, null, 2)}
        </pre>
      </div>
    </div>
  );
}
