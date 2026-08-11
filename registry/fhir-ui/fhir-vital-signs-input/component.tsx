"use client";

import React, { useMemo } from "react";
import { type Observation } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { FHIRQuantityInput, type QuantityPreset, cleanAndParseQuantity, getQuantityValidationBadge } from "@/registry/fhir-ui/fhir-quantity-input";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";
import { observationsToVitalSigns, vitalSignsToObservations, type VitalSignsState } from "@/lib/fhir/vital-signs";

export type VitalSignsPreset = QuantityPreset | "blood-pressure" | "height-weight";

export interface FHIRVitalSignsInputProps {
  value?: Observation[];
  onChange?: (observations: Observation[]) => void;
  patientId?: string;
  encounterId?: string;
  readOnly?: boolean;
  className?: string;
  preset?: VitalSignsPreset;
  patientGender?: "male" | "female";
}

const syncDisplay = (value: number | undefined, currentDisplay: string, setDisplay: (v: string) => void) => {
  if (value !== undefined) {
    if (parseFloat(currentDisplay.replace(/,/g, "")) !== value) {
      setDisplay(String(value));
    }
  } else {
    setDisplay("");
  }
};

const presetToStateKey: Record<QuantityPreset, keyof VitalSignsState> = {
  systolic: "systolic",
  diastolic: "diastolic",
  "heart-rate": "heartRate",
  temperature: "temperature",
  "respiratory-rate": "respiratoryRate",
  spo2: "spo2",
  weight: "weight",
  height: "height",
  "waist-circumference": "waistCircumference",
};

export function FHIRVitalSignsInput({
  value = [],
  onChange,
  patientId = "patient-1",
  encounterId = "encounter-1",
  readOnly = false,
  className,
  preset,
  patientGender,
}: FHIRVitalSignsInputProps) {
  // Parse state from incoming FHIR Observations
  const vitals: VitalSignsState = useMemo(() => observationsToVitalSigns(value), [value]);

  // Combined input states for controlled textual syncing
  const [sysDisplay, setSysDisplay] = React.useState<string>("");
  const [diaDisplay, setDiaDisplay] = React.useState<string>("");
  const [heightDisplay, setHeightDisplay] = React.useState<string>("");
  const [weightDisplay, setWeightDisplay] = React.useState<string>("");
  const [wcDisplay, setWcDisplay] = React.useState<string>("");

  React.useEffect(() => syncDisplay(vitals.systolic, sysDisplay, setSysDisplay), [vitals.systolic, sysDisplay]);
  React.useEffect(() => syncDisplay(vitals.diastolic, diaDisplay, setDiaDisplay), [vitals.diastolic, diaDisplay]);
  React.useEffect(() => syncDisplay(vitals.height, heightDisplay, setHeightDisplay), [vitals.height, heightDisplay]);
  React.useEffect(() => syncDisplay(vitals.weight, weightDisplay, setWeightDisplay), [vitals.weight, weightDisplay]);
  React.useEffect(() => syncDisplay(vitals.waistCircumference, wcDisplay, setWcDisplay), [vitals.waistCircumference, wcDisplay]);

  // Handler to update specific vital metric and re-emit all FHIR observations
  const handleVitalChange = (field: keyof VitalSignsState, val: number | undefined) => {
    if (readOnly || !onChange) return;

    const nextState = { ...vitals, [field]: val };
    const observations = vitalSignsToObservations(nextState, { patientId, encounterId });

    onChange(observations);
  };

  // 1. Blood Pressure Validation Badge (incorporating BPJS ranges)
  const bpValidationBadge = React.useMemo(() => {
    const sys = vitals.systolic;
    const dia = vitals.diastolic;
    if (sys === undefined && dia === undefined) return null;

    // BPJS limits validation
    const sysInvalid = sys !== undefined && (sys < 50 || sys > 250);
    const diaInvalid = dia !== undefined && (dia < 30 || dia > 150);
    if (sysInvalid || diaInvalid) {
      return { label: "Invalid BP", color: "text-destructive bg-destructive/10 border-destructive/20" };
    }

    if (sys === undefined || dia === undefined) return null;

    const isCrisis = sys >= 180 || dia >= 120;
    const isCriticalLow = sys < 70 || dia < 45;
    const isHigh = sys >= 140 || dia >= 90;
    const isLow = sys < 90 || dia < 60;
    const isPre = (sys >= 120 && sys < 140) || (dia >= 80 && dia < 90);

    if (isCrisis) return { label: "Crisis", color: "text-destructive bg-destructive/10 border-destructive/20" };
    if (isCriticalLow) return { label: "Critical Low", color: "text-destructive bg-destructive/10 border-destructive/20" };
    if (isHigh) return { label: "Hypertension", color: "text-destructive bg-destructive/10 border-destructive/20" };
    if (isLow) return { label: "Hypotension", color: "text-sky-600 bg-sky-500/10 border-sky-500/20" };
    if (isPre) return { label: "Prehypertension", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" };
    return { label: "Normal", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
  }, [vitals.systolic, vitals.diastolic]);

  // 2. Height & Weight Validation & BMI Badge (incorporating BPJS ranges)
  const hwValidationBadge = React.useMemo(() => {
    const h = vitals.height;
    const w = vitals.weight;
    if (h === undefined && w === undefined) return null;

    // BPJS limits validation
    const hInvalid = h !== undefined && (h < 30 || h > 250);
    const wInvalid = w !== undefined && (w < 1 || w > 300);
    if (hInvalid || wInvalid) {
      return { label: "Invalid H/W", color: "text-destructive bg-destructive/10 border-destructive/20" };
    }

    if (h === undefined || w === undefined || h <= 0) return null;
    const heightM = h / 100;
    const score = parseFloat((w / (heightM * heightM)).toFixed(1));

    if (score < 16.0) return { label: `BMI: ${score} (Severe Underweight)`, color: "text-destructive bg-destructive/10 border-destructive/20" };
    if (score < 18.5) return { label: `BMI: ${score} (Underweight)`, color: "text-sky-600 bg-sky-500/10 border-sky-500/20" };
    if (score >= 35.0) return { label: `BMI: ${score} (Severe Obese)`, color: "text-destructive bg-destructive/10 border-destructive/20" };
    if (score >= 30.0) return { label: `BMI: ${score} (Obese)`, color: "text-destructive bg-destructive/10 border-destructive/20" };
    if (score >= 25 && score < 30) return { label: `BMI: ${score} (Overweight)`, color: "text-amber-600 bg-amber-500/10 border-amber-500/20" };
    return { label: `BMI: ${score} (Normal)`, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
  }, [vitals.height, vitals.weight]);

  // 3. Waist Circumference Validation Badge
  const wcValidationBadge = React.useMemo(() => {
    const wc = vitals.waistCircumference;
    if (wc === undefined) return null;
    return getQuantityValidationBadge("waist-circumference", wc, patientGender);
  }, [vitals.waistCircumference, patientGender]);

  const renderBloodPressureField = () => (
    <Field>
      <div className="flex items-center justify-between gap-2 w-full">
        <FieldLabel>Blood Pressure</FieldLabel>
        {bpValidationBadge && (
          <Badge
            variant="outline"
            className={cn("text-[10px] font-semibold uppercase", bpValidationBadge.color)}
          >
            {bpValidationBadge.label}
          </Badge>
        )}
      </div>
      <InputGroup className="relative flex w-full items-center overflow-hidden h-8">
        <InputGroupInput
          type="text"
          inputMode="decimal"
          placeholder="90-120"
          value={sysDisplay}
          onChange={(e) => {
            const { display, parsed } = cleanAndParseQuantity(e.target.value);
            setSysDisplay(display);
            handleVitalChange("systolic", parsed);
          }}
          readOnly={readOnly}
          disabled={readOnly}
          className="min-w-0 h-full border-0 focus-visible:ring-0 text-right pr-2 disabled:opacity-85 font-mono text-sm"
        />
        <InputGroupText className="px-1.5 text-muted-foreground select-none">/</InputGroupText>
        <InputGroupInput
          type="text"
          inputMode="decimal"
          placeholder="60-80"
          value={diaDisplay}
          onChange={(e) => {
            const { display, parsed } = cleanAndParseQuantity(e.target.value);
            setDiaDisplay(display);
            handleVitalChange("diastolic", parsed);
          }}
          readOnly={readOnly}
          disabled={readOnly}
          className="w-16 flex-none h-full border-0 focus-visible:ring-0 text-left pl-2 disabled:opacity-85 font-mono text-sm"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupText>mmHg</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );

  const renderHeightWeightField = () => (
    <Field>
      <div className="flex items-center justify-between gap-2 w-full">
        <FieldLabel>Height &amp; Weight</FieldLabel>
        {hwValidationBadge && (
          <Badge
            variant="outline"
            className={cn("text-[10px] font-semibold uppercase", hwValidationBadge.color)}
          >
            {hwValidationBadge.label}
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 w-full">
        <InputGroup className="relative flex w-full items-center overflow-hidden h-8">
          <InputGroupInput
            type="text"
            inputMode="decimal"
            placeholder="30-250"
            value={heightDisplay}
            onChange={(e) => {
              const { display, parsed } = cleanAndParseQuantity(e.target.value);
              setHeightDisplay(display);
              handleVitalChange("height", parsed);
            }}
            readOnly={readOnly}
            disabled={readOnly}
            className="min-w-0 h-full border-0 focus-visible:ring-0 text-right pr-2 disabled:opacity-85 font-mono text-sm"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>cm</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup className="relative flex w-full items-center overflow-hidden h-8">
          <InputGroupInput
            type="text"
            inputMode="decimal"
            placeholder="1-300"
            value={weightDisplay}
            onChange={(e) => {
              const { display, parsed } = cleanAndParseQuantity(e.target.value);
              setWeightDisplay(display);
              handleVitalChange("weight", parsed);
            }}
            readOnly={readOnly}
            disabled={readOnly}
            className="min-w-0 h-full border-0 focus-visible:ring-0 text-right pr-2 disabled:opacity-85 font-mono text-sm"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>kg</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </Field>
  );

  // If a specific preset (individual metric) is requested
  if (preset && preset !== "blood-pressure" && preset !== "height-weight") {
    const stateKey = presetToStateKey[preset];
    const val = vitals[stateKey];
    return (
      <div className={cn("w-full max-w-sm", className)}>
        <FHIRQuantityInput
          preset={preset}
          value={val !== undefined ? { value: val } : undefined}
          onChange={(q) => handleVitalChange(stateKey, q.value)}
          hideComparator
          readOnly={readOnly}
          validationBadge={
            preset === "weight"
              ? hwValidationBadge
              : preset === "waist-circumference"
              ? wcValidationBadge
              : undefined
          }
          patientGender={patientGender}
        />
      </div>
    );
  }

  // Render Systolic + Diastolic blood pressure side-by-side (either as preset or internal)
  if (preset === "blood-pressure") {
    return (
      <div className={cn("w-full max-w-md", className)}>
        {renderBloodPressureField()}
      </div>
    );
  }

  // Render Height + Weight combined (either as preset or internal)
  if (preset === "height-weight") {
    return (
      <div className={cn("w-full max-w-md", className)}>
        {renderHeightWeightField()}
      </div>
    );
  }

  // Fallback: render the entire grid panel (when preset is undefined) with merged BP and Height/Weight groups
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Blood Pressure Input Group */}
        {renderBloodPressureField()}

        {/* 2. Height & Weight Input Group */}
        {renderHeightWeightField()}

        {/* 3. Heart Rate */}
        <FHIRQuantityInput
          preset="heart-rate"
          value={vitals.heartRate !== undefined ? { value: vitals.heartRate } : undefined}
          onChange={(q) => handleVitalChange("heartRate", q.value)}
          hideComparator
          readOnly={readOnly}
        />

        {/* 4. Temperature */}
        <FHIRQuantityInput
          preset="temperature"
          value={vitals.temperature !== undefined ? { value: vitals.temperature } : undefined}
          onChange={(q) => handleVitalChange("temperature", q.value)}
          hideComparator
          readOnly={readOnly}
        />

        {/* 5. Respiratory Rate */}
        <FHIRQuantityInput
          preset="respiratory-rate"
          value={vitals.respiratoryRate !== undefined ? { value: vitals.respiratoryRate } : undefined}
          onChange={(q) => handleVitalChange("respiratoryRate", q.value)}
          hideComparator
          readOnly={readOnly}
        />

        {/* 6. SpO2 */}
        <FHIRQuantityInput
          preset="spo2"
          value={vitals.spo2 !== undefined ? { value: vitals.spo2 } : undefined}
          onChange={(q) => handleVitalChange("spo2", q.value)}
          hideComparator
          readOnly={readOnly}
        />

        {/* 7. Waist Circumference (Lingkar Perut) */}
        <FHIRQuantityInput
          preset="waist-circumference"
          value={vitals.waistCircumference !== undefined ? { value: vitals.waistCircumference } : undefined}
          onChange={(q) => handleVitalChange("waistCircumference", q.value)}
          hideComparator
          readOnly={readOnly}
          validationBadge={wcValidationBadge}
          patientGender={patientGender}
        />
      </div>
    </div>
  );
}
