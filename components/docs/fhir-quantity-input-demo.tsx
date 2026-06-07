"use client";

import * as React from "react";
import { FHIRQuantityInput, type QuantityPreset } from "@/registry/fhir-ui/fhir-quantity-input";
import { type Quantity } from "@medplum/fhirtypes";

interface FHIRQuantityInputDemoProps {
  preset?: QuantityPreset;
}

export function FHIRQuantityInputDemo({ preset }: FHIRQuantityInputDemoProps = {}) {
  const [systolic, setSystolic] = React.useState<Quantity>({});
  const [diastolic, setDiastolic] = React.useState<Quantity>({});
  const [temperature, setTemperature] = React.useState<Quantity>({});
  const [weight, setWeight] = React.useState<Quantity>({});
  const [height, setHeight] = React.useState<Quantity>({});

  const [presetVal, setPresetVal] = React.useState<Quantity>({});

  if (preset) {
    return (
      <div className="w-full space-y-6 max-w-sm">
        <FHIRQuantityInput
          preset={preset}
          value={presetVal}
          onChange={setPresetVal}
          patientGender={preset === "waist-circumference" ? "female" : undefined}
        />
        <div className="rounded-lg border bg-muted/30 p-4 font-mono text-xs">
          <div className="font-semibold text-muted-foreground mb-2 flex items-center justify-between">
            <span>onChange Output (FHIR Quantity)</span>
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans">JavaScript Object</span>
          </div>
          <pre className="overflow-x-auto text-foreground max-h-[150px] scrollbar-thin">
            {Object.keys(presetVal).length > 0
              ? JSON.stringify(presetVal, null, 2)
              : "No value recorded yet. Enter a value above."}
          </pre>
        </div>
      </div>
    );
  }

  const combinedVitals = {
    systolic: Object.keys(systolic).length ? systolic : undefined,
    diastolic: Object.keys(diastolic).length ? diastolic : undefined,
    temperature: Object.keys(temperature).length ? temperature : undefined,
    weight: Object.keys(weight).length ? weight : undefined,
    height: Object.keys(height).length ? height : undefined,
  };

  // Clean up undefined properties for a cleaner preview output
  const activeVitals = Object.fromEntries(
    Object.entries(combinedVitals).filter(([_, v]) => v !== undefined)
  );

  return (
    <div className="w-full space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FHIRQuantityInput
          code="mm[Hg]"
          label="Systolic Blood Pressure"
          description="Normal: < 120 mmHg"
          onChange={setSystolic}
        />
        <FHIRQuantityInput
          code="mm[Hg]"
          label="Diastolic Blood Pressure"
          onChange={setDiastolic}
        />
        <FHIRQuantityInput
          code="Cel"
          label="Body Temperature"
          onChange={setTemperature}
        />
        <FHIRQuantityInput
          code="kg"
          label="Weight"
          description="Measured at registration"
          onChange={setWeight}
        />
        <div>
          <FHIRQuantityInput
            code="cm"
            label="Height"
            onChange={setHeight}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 font-mono text-xs">
        <div className="font-semibold text-muted-foreground mb-2 flex items-center justify-between">
          <span>onChange Outputs (FHIR Quantity Objects)</span>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans">JavaScript Objects</span>
        </div>
        <pre className="overflow-x-auto text-foreground max-h-[300px] scrollbar-thin">
          {JSON.stringify(activeVitals, null, 2)}
        </pre>
      </div>
    </div>
  );
}
