"use client";

import React, { useState } from "react";
import { FHIRVitalSignsInput, type VitalSignsPreset } from "@/registry/fhir-ui/fhir-vital-signs-input";
import { type Observation } from "@medplum/fhirtypes";

interface FHIRVitalSignsInputDemoProps {
  preset?: VitalSignsPreset;
  defaultGender?: "male" | "female";
}

export function FHIRVitalSignsInputDemo({ preset, defaultGender }: FHIRVitalSignsInputDemoProps) {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [patientGender, setPatientGender] = useState<"male" | "female" | undefined>(defaultGender);

  const title = preset
    ? `Vital Sign Input (${preset.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")})`
    : "Vital Signs Panel (Observation Input)";

  const description = preset
    ? `Individual input for capturing a ${preset} vital sign directly emitting FHIR Observations.`
    : "Enter patient metrics below. Out-of-bounds metrics automatically trigger inline validation badges, and BMI is auto-computed.";

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl min-h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Gender Selection Control for gender-sensitive rules (Waist Circumference / Lingkar Perut) */}
        {(!preset || preset === "waist-circumference") && (
          <div className="flex items-center gap-2 bg-muted/40 p-1.5 rounded-lg border border-border/80 self-start sm:self-center">
            <span className="text-[11px] font-medium text-muted-foreground px-2">Gender:</span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setPatientGender("male")}
                className={`px-2.5 py-1 text-xs rounded transition-all duration-150 ${
                  patientGender === "male"
                    ? "bg-background text-foreground shadow-sm font-semibold border border-border"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setPatientGender("female")}
                className={`px-2.5 py-1 text-xs rounded transition-all duration-150 ${
                  patientGender === "female"
                    ? "bg-background text-foreground shadow-sm font-semibold border border-border"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                Female
              </button>
            </div>
          </div>
        )}
      </div>

      <FHIRVitalSignsInput
        value={observations}
        onChange={setObservations}
        preset={preset}
        patientGender={patientGender}
        className="w-full"
      />

      <div className="w-full p-4 bg-muted/50 rounded-lg overflow-auto max-h-[300px] border border-border">
        <p className="text-sm font-semibold mb-2 text-foreground">
          Generated FHIR Observation Resources ({observations.length}):
        </p>
        <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
          {observations.length > 0
            ? JSON.stringify(observations, null, 2)
            : "No vitals recorded yet. Adjust fields above to generate HL7 FHIR Observation payloads."}
        </pre>
      </div>
    </div>
  );
}
