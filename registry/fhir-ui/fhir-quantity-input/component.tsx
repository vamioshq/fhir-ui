"use client";

import * as React from "react";
import { type Quantity } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Scale } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export const UCUM_MAPPING: Record<string, string> = {
  // Temperature
  "Cel": "°C",
  "[degF]": "°F",
  // Blood Pressure / Pressure
  "mm[Hg]": "mmHg",
  // Weight/Mass
  "kg": "kg",
  "g": "g",
  "mg": "mg",
  "ug": "µg",
  "[lb_av]": "lbs",
  // Height/Length
  "cm": "cm",
  "m": "m",
  "in": "in",
  "[in_i]": "in",
  // BMI
  "kg/m2": "kg/m²",
  // Rate / Frequency
  "/min": "bpm",
  "/s": "/s",
  // Volumes
  "mL": "mL",
  "L": "L",
  "dL": "dL",
  // Concentrations / Chemistry / Labs
  "mg/dL": "mg/dL",
  "mmol/L": "mmol/L",
  "umol/L": "µmol/L",
  "nmol/L": "nmol/L",
  "ug/dL": "µg/dL",
  "ng/mL": "ng/mL",
  "U/L": "U/L",
  "uIU/mL": "µIU/mL",
  "mIU/L": "mIU/L",
  // Others
  "%": "%",
  "1": "",
};

export type QuantityPreset =
  | "systolic"
  | "diastolic"
  | "heart-rate"
  | "temperature"
  | "respiratory-rate"
  | "spo2"
  | "weight"
  | "height"
  | "waist-circumference";

export interface FHIRQuantityInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: Quantity;
  onChange?: (value: Quantity) => void;
  label?: string;
  unit?: string;
  code?: string;
  description?: string;
  hideComparator?: boolean;
  readOnly?: boolean;
  preset?: QuantityPreset;
  validationBadge?: { label: string; color: string } | null;
  placeholder?: string;
  patientGender?: "male" | "female";
}

export function cleanAndParseQuantity(val: string): { display: string; parsed: number | undefined } {
  let rawVal = val.replace(/,/g, ".").replace(/[^0-9.-]/g, "");
  if (rawVal.startsWith("-")) {
    rawVal = "-" + rawVal.substring(1).replace(/-/g, "");
  } else {
    rawVal = rawVal.replace(/-/g, "");
  }
  const parts = rawVal.split(".");
  if (parts.length > 2) {
    rawVal = parts[0] + "." + parts.slice(1).join("");
  }
  const parsed = rawVal && rawVal !== "-" ? parseFloat(rawVal) : undefined;
  return { display: rawVal, parsed };
}

export function getQuantityValidationBadge(
  preset: QuantityPreset,
  qtyValue: number,
  gender?: "male" | "female"
): { label: string; color: string } | null {
  switch (preset) {
    case "systolic":
      if (qtyValue < 50 || qtyValue > 250) return { label: "Invalid", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue < 70) return { label: "Critical Low", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue >= 180) return { label: "Crisis", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue >= 140) return { label: "High", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue < 90) return { label: "Low", color: "text-sky-600 bg-sky-500/10 border-sky-500/20" };
      if (qtyValue >= 120) return { label: "Pre-High", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" };
      return { label: "Normal", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
    case "diastolic":
      if (qtyValue < 30 || qtyValue > 150) return { label: "Invalid", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue < 45) return { label: "Critical Low", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue >= 120) return { label: "Crisis", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue >= 90) return { label: "High", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue < 60) return { label: "Low", color: "text-sky-600 bg-sky-500/10 border-sky-500/20" };
      if (qtyValue >= 80) return { label: "Pre-High", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" };
      return { label: "Normal", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
    case "heart-rate":
      if (qtyValue < 30 || qtyValue > 220) return { label: "Invalid", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue < 40) return { label: "Critical Low", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue > 150) return { label: "Critical High", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue > 100) return { label: "High", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue < 60) return { label: "Low", color: "text-sky-600 bg-sky-500/10 border-sky-500/20" };
      return { label: "Normal", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
    case "temperature":
      if (qtyValue < 25.0 || qtyValue > 42.0) return { label: "Invalid", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue < 35.0) return { label: "Critical Low", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue > 37.5) return { label: "Fever", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue < 36.0) return { label: "Low Temp", color: "text-sky-600 bg-sky-500/10 border-sky-500/20" };
      return { label: "Normal", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
    case "respiratory-rate":
      if (qtyValue < 6 || qtyValue > 60) return { label: "Invalid", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue < 9) return { label: "Critical Low", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue > 30) return { label: "Critical High", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue > 20) return { label: "High", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue < 12) return { label: "Low", color: "text-sky-600 bg-sky-500/10 border-sky-500/20" };
      return { label: "Normal", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
    case "spo2":
      if (qtyValue < 50 || qtyValue > 100) return { label: "Invalid", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue < 90) return { label: "Critical Low", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue < 95) return { label: "Low", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" };
      return { label: "Normal", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
    case "weight":
      if (qtyValue < 1 || qtyValue > 300) return { label: "Invalid", color: "text-destructive bg-destructive/10 border-destructive/20" };
      return null;
    case "height":
      if (qtyValue < 30 || qtyValue > 250) return { label: "Invalid", color: "text-destructive bg-destructive/10 border-destructive/20" };
      return null;
    case "waist-circumference":
      if (qtyValue < 10 || qtyValue > 300) return { label: "Invalid", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (gender === "male") {
        if (qtyValue >= 90) return { label: "Central Obesity", color: "text-destructive bg-destructive/10 border-destructive/20" };
        return { label: "Normal", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
      }
      if (gender === "female") {
        if (qtyValue >= 80) return { label: "Central Obesity", color: "text-destructive bg-destructive/10 border-destructive/20" };
        return { label: "Normal", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
      }
      if (qtyValue >= 90) return { label: "Central Obesity (M)", color: "text-destructive bg-destructive/10 border-destructive/20" };
      if (qtyValue >= 80) return { label: "Central Obesity (F)", color: "text-destructive bg-destructive/10 border-destructive/20" };
      return { label: "Normal", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
    default:
      return null;
  }
}

export function FHIRQuantityInput({
  value,
  onChange,
  label = "Measurement (Quantity)",
  unit,
  code,
  description,
  className,
  hideComparator = false,
  readOnly = false,
  preset,
  validationBadge,
  placeholder,
  patientGender,
  ...props
}: FHIRQuantityInputProps) {
  // If a preset is provided, override default props
  const presetConfig = React.useMemo(() => {
    if (!preset) return null;

    switch (preset) {
      case "systolic":
        return { label: "Systolic BP", unit: "mmHg", code: "mm[Hg]", placeholder: "90-120" };
      case "diastolic":
        return { label: "Diastolic BP", unit: "mmHg", code: "mm[Hg]", placeholder: "60-80" };
      case "heart-rate":
        return { label: "Heart Rate", unit: "bpm", code: "/min", placeholder: "60-100" };
      case "temperature":
        return { label: "Body Temperature", unit: "°C", code: "Cel", placeholder: "36.1-37.2" };
      case "respiratory-rate":
        return { label: "Respiratory Rate", unit: "breaths/min", code: "/min", placeholder: "12-20" };
      case "spo2":
        return { label: "Oxygen Saturation (SpO2)", unit: "%", code: "%", placeholder: "95-100" };
      case "weight":
        return { label: "Weight", unit: "kg", code: "kg", placeholder: "1-300" };
      case "height":
        return { label: "Height", unit: "cm", code: "cm", placeholder: "30-250" };
      case "waist-circumference":
        return { label: "Waist Circumference", unit: "cm", code: "cm", placeholder: "30-250" };
      default:
        return null;
    }
  }, [preset]);

  const activeLabel = label !== "Measurement (Quantity)" ? label : (presetConfig?.label ?? label);
  const activeCode = code ?? (presetConfig?.code ?? unit);
  const activeUnit = unit ?? (presetConfig?.unit ?? (code ? (UCUM_MAPPING[code] ?? code) : "unit"));

  const [qtyValue, setQtyValue] = React.useState<number | undefined>(value?.value);

  const activeValidationBadge = React.useMemo(() => {
    if (validationBadge !== undefined) return validationBadge;
    if (!preset || qtyValue === undefined) return null;
    return getQuantityValidationBadge(preset, qtyValue, patientGender);
  }, [preset, qtyValue, validationBadge, patientGender]);

  const [comparator, setComparator] = React.useState<Quantity["comparator"] | "=">((value?.comparator || "=") as any);
  const [displayValue, setDisplayValue] = React.useState<string>(
    value?.value !== undefined ? String(value.value) : ""
  );

  // Sync state if value prop changes
  React.useEffect(() => {
    setQtyValue(value?.value);
    setComparator((value?.comparator || "=") as any);

    if (value?.value !== undefined) {
      const currentParsed = parseFloat(displayValue);
      if (currentParsed !== value.value) {
        setDisplayValue(String(value.value));
      }
    } else {
      setDisplayValue("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- displayValue is intentionally omitted to avoid resetting the input formatting/cursor position while the user is typing
  }, [value]);

  const updateQuantity = (
    newVal: number | undefined,
    newComparator: Quantity["comparator"] | "="
  ) => {
    if (!onChange) return;

    const updated: Quantity = {
      value: newVal,
      comparator: (newComparator || "=") as any,
      unit: activeUnit !== "unit" ? activeUnit : undefined,
      system: activeUnit !== "unit" ? "http://unitsofmeasure.org" : undefined,
      code: activeCode || undefined,
    };

    onChange(updated);
  };

  const handleComparatorChange = (val: string) => {
    const nextComparator = val as Quantity["comparator"] | "=";
    setComparator(nextComparator);
    updateQuantity(qtyValue, nextComparator);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { display, parsed } = cleanAndParseQuantity(e.target.value);
    setDisplayValue(display);
    setQtyValue(parsed);
    updateQuantity(parsed, comparator);
  };

  return (
    <div className={cn(className)} {...props}>
      <Field>
        <div className="flex items-center justify-between gap-2 w-full">
          <FieldLabel>{activeLabel}</FieldLabel>
          {activeValidationBadge && (
            <Badge
              variant="outline"
              className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider", activeValidationBadge.color)}
            >
              {activeValidationBadge.label}
            </Badge>
          )}
        </div>
        <InputGroup className="relative flex w-full items-center overflow-hidden h-8">
          {/* Comparator Operator Select Dropdown */}
          {!hideComparator && (
            <InputGroupAddon>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <InputGroupButton
                    variant="ghost"
                    aria-label="Select comparator"
                    className="font-mono text-xs w-8 h-6 flex items-center justify-center"
                  >
                    {comparator || "="}
                  </InputGroupButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onSelect={() => handleComparatorChange("=")}>=</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleComparatorChange("<")}>&lt;</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleComparatorChange("<=")}>&le;</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleComparatorChange(">=")}>&ge;</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleComparatorChange(">")}>&gt;</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </InputGroupAddon>
          )}

          {/* Numeric Value Input */}
          <InputGroupInput
            type="text"
            inputMode="decimal"
            placeholder={placeholder ?? (presetConfig?.placeholder ?? "Value (e.g. 120)")}
            value={displayValue}
            onChange={handleValueChange}
            readOnly={readOnly}
            disabled={readOnly}
            className="min-w-0 h-full border-0 focus-visible:ring-0 text-right pr-3 disabled:opacity-85"
          />

          {/* Unit */}
          <InputGroupAddon align="inline-end">
            <InputGroupText>{activeUnit}</InputGroupText>
          </InputGroupAddon>
        </InputGroup>

        {description && <FieldDescription>{description}</FieldDescription>}
      </Field>
    </div>
  );
}
