"use client";

import * as React from "react";
import { type Dosage } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

export interface FHIRDosageInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "value"> {
  value?: Dosage;
  onChange?: (value: Dosage) => void;
  readOnly?: boolean;
  showLabel?: boolean;
  layout?: "flex" | "grid";
}

interface DosageState {
  sequence: number;
  text: string;
  doseValue?: number;
  doseUnit: string;
  frequency?: number;
  period?: number;
  periodUnit: string;
  when?: string;
  routeCode?: string;
  routeDisplay?: string;
  asNeeded?: boolean;
}

interface RouteOption {
  code: string;
  display: string;
  label: string;
}

const ROUTE_OPTIONS: RouteOption[] = [
  { code: "26643006", display: "Oral route", label: "Oral" },
  { code: "47625008", display: "Intravenous route", label: "Intravenous (IV)" },
  { code: "78421000", display: "Intramuscular route", label: "Intramuscular (IM)" },
  { code: "34246000", display: "Subcutaneous route", label: "Subcutaneous (SC)" },
  { code: "30737004", display: "Inhalation route", label: "Inhalation" },
  { code: "372454008", display: "Topical route", label: "Topical" },
  { code: "46706006", display: "Administration of medicine by drops", label: "Drops" },
  { code: "37839007", display: "Sublingual route", label: "Sublingual" },
  { code: "37161004", display: "Rectal route", label: "Rectal / Suppository" },
  { code: "54485002", display: "Ophthalmic route", label: "Ophthalmic (Eye)" },
  { code: "10547007", display: "Otic route", label: "Otic (Ear)" },
];

interface UnitOption {
  label: string;
  system: string;
  code: string;
}

const UNIT_OPTIONS: Record<string, UnitOption> = {
  "tablet": { label: "Tablet", system: "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm", code: "TAB" },
  "mg": { label: "mg", system: "http://unitsofmeasure.org", code: "mg" },
  "ml": { label: "mL", system: "http://unitsofmeasure.org", code: "mL" },
  "kapsul": { label: "Capsule", system: "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm", code: "CAP" },
  "tetes": { label: "Drops", system: "http://unitsofmeasure.org", code: "gtt" },
  "sendok": { label: "Spoon", system: "http://unitsofmeasure.org", code: "[tsp]" },
  "mcg": { label: "mcg", system: "http://unitsofmeasure.org", code: "ug" },
  "g": { label: "g", system: "http://unitsofmeasure.org", code: "g" },
  "sachet": { label: "Sachet", system: "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm", code: "SAC" },
  "IU": { label: "IU", system: "http://unitsofmeasure.org", code: "[IU]" },
  "puff": { label: "Puff", system: "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm", code: "POW" },
  "ampul": { label: "Ampoule", system: "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm", code: "AMP" },
  "vial": { label: "Vial", system: "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm", code: "VIAL" },
};

const generateAutoText = (s: Omit<DosageState, "text">): string => {
  if (s.doseValue === undefined) return "";
  const unitLabel = s.doseUnit ? (UNIT_OPTIONS[s.doseUnit]?.label || s.doseUnit) : "";
  const freqText = s.frequency ? `${s.frequency}x` : "";
  
  let periodUnitText = "";
  if (s.periodUnit === "d") {
    periodUnitText = !s.period || s.period === 1 ? "daily" : `every ${s.period} days`;
  } else if (s.periodUnit === "h") {
    periodUnitText = !s.period || s.period === 1 ? "every hour" : `every ${s.period} hours`;
  } else if (s.periodUnit === "wk") {
    periodUnitText = !s.period || s.period === 1 ? "weekly" : `every ${s.period} weeks`;
  } else if (s.periodUnit === "mo") {
    periodUnitText = !s.period || s.period === 1 ? "monthly" : `every ${s.period} months`;
  } else {
    periodUnitText = `every ${s.period || 1} ${s.periodUnit}`;
  }

  const mealText = s.when === "AC" ? "before meals" : s.when === "PC" ? "after meals" : s.when === "CC" ? "with meals" : s.when === "HS" ? "before sleep" : "";
  const routeText = s.routeCode ? `via ${ROUTE_OPTIONS.find(r => r.code === s.routeCode)?.label || ""}` : "";
  const prnText = s.asNeeded ? "(as needed)" : "";

  return [
    `${s.doseValue} ${unitLabel}`,
    freqText,
    periodUnitText,
    mealText,
    routeText,
    prnText,
  ].filter(Boolean).join(" ");
};

const parseDosage = (dosage: Dosage | undefined): DosageState => {
  if (!dosage) {
    return {
      sequence: 1,
      text: "",
      doseValue: undefined,
      doseUnit: "",
      frequency: undefined,
      period: 1,
      periodUnit: "d",
      when: undefined,
      routeCode: undefined,
      routeDisplay: undefined,
      asNeeded: false,
    };
  }

  const repeat = dosage.timing?.repeat;
  const coding = dosage.route?.coding?.[0];
  const doseAndRate = dosage.doseAndRate?.[0];
  const doseValue = doseAndRate?.doseQuantity?.value;
  const doseUnit = doseAndRate?.doseQuantity?.unit;

  return {
    sequence: dosage.sequence || 1,
    text: dosage.text || "",
    doseValue,
    doseUnit: doseUnit || "",
    frequency: repeat?.frequency,
    period: repeat?.period !== undefined ? repeat.period : 1,
    periodUnit: repeat?.periodUnit || "d",
    when: repeat?.when?.[0],
    routeCode: coding?.code,
    routeDisplay: coding?.display,
    asNeeded: !!dosage.asNeededBoolean,
  };
};

const constructDosage = (state: DosageState, hasManualOverride: boolean): Dosage => {
  const timingRepeat: any = {};
  if (state.frequency !== undefined) {
    timingRepeat.frequency = Number(state.frequency);
    timingRepeat.period = state.period !== undefined ? Number(state.period) : 1;
    timingRepeat.periodUnit = state.periodUnit || "d";
  }
  if (state.when) timingRepeat.when = [state.when];

  const timing = Object.keys(timingRepeat).length > 0 ? { repeat: timingRepeat } : undefined;

  const routeCoding = state.routeCode
    ? [
        {
          system: "http://snomed.info/sct",
          code: state.routeCode,
          display: state.routeDisplay || ROUTE_OPTIONS.find(r => r.code === state.routeCode)?.display || "",
        },
      ]
    : undefined;
  const route = routeCoding ? { coding: routeCoding } : undefined;

  const doseQuantity: any = {};
  if (state.doseValue !== undefined) doseQuantity.value = Number(state.doseValue);
  if (state.doseUnit) {
    doseQuantity.unit = state.doseUnit;
    const unitMeta = UNIT_OPTIONS[state.doseUnit];
    if (unitMeta) {
      doseQuantity.system = unitMeta.system;
      doseQuantity.code = unitMeta.code;
    }
  }

  const doseAndRate = Object.keys(doseQuantity).length > 0
    ? [
        {
          type: {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/dose-rate-type",
                code: "ordered",
                display: "Ordered",
              },
            ],
          },
          doseQuantity,
        },
      ]
    : undefined;

  const computedText = hasManualOverride ? state.text : generateAutoText(state);

  return {
    sequence: Number(state.sequence) || 1,
    text: computedText || undefined,
    timing,
    route,
    doseAndRate,
    asNeededBoolean: state.asNeeded || undefined,
  };
};

export function FHIRDosageInput({
  value,
  onChange,
  readOnly = false,
  showLabel = false,
  layout = "flex",
  className,
  ...props
}: FHIRDosageInputProps) {
  const [state, setState] = React.useState<DosageState>(() => parseDosage(value));

  const [freqDisplay, setFreqDisplay] = React.useState("");
  const [periodDisplay, setPeriodDisplay] = React.useState("");
  const [doseDisplay, setDoseDisplay] = React.useState("");
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [hasManualOverride, setHasManualOverride] = React.useState(false);

  // Sync state if value prop changes
  React.useEffect(() => {
    const parsed = parseDosage(value);
    setState(parsed);
    setFreqDisplay(parsed.frequency !== undefined ? String(parsed.frequency) : "");
    setPeriodDisplay(parsed.period !== undefined ? String(parsed.period) : "");
    setDoseDisplay(parsed.doseValue !== undefined ? String(parsed.doseValue) : "");

    // Check if the text matches the auto-generated format or if it is a manual override
    if (parsed.text) {
      const generated = generateAutoText(parsed);
      if (parsed.text !== generated) {
        setHasManualOverride(true);
      } else {
        setHasManualOverride(false);
      }
    } else {
      setHasManualOverride(false);
    }
  }, [value]);

  const handleStateChange = (updates: Partial<DosageState>, customOverrideFlag?: boolean) => {
    if (readOnly) return;
    const nextState = { ...state, ...updates };
    setState(nextState);

    // Keep inputs synced on modification (e.g. from stepper buttons)
    if (updates.frequency !== undefined) {
      setFreqDisplay(updates.frequency !== undefined ? String(updates.frequency) : "");
    }
    if (updates.period !== undefined) {
      setPeriodDisplay(updates.period !== undefined ? String(updates.period) : "");
    }
    if (updates.doseValue !== undefined) {
      setDoseDisplay(updates.doseValue !== undefined ? String(updates.doseValue) : "");
    }

    const overrideActive = customOverrideFlag !== undefined ? customOverrideFlag : hasManualOverride;

    if (onChange) {
      onChange(constructDosage(nextState, overrideActive));
    }
  };

  const handleFreqChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, ""); // Positive integers only
    setFreqDisplay(raw);
    const parsed = raw ? parseInt(raw, 10) : undefined;
    handleStateChange({ frequency: parsed });
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, ""); // Positive integers only
    setPeriodDisplay(raw);
    const parsed = raw ? parseInt(raw, 10) : undefined;
    handleStateChange({ period: parsed });
  };

  const handleDoseValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Floats allowed for decimal dose fractions
    let rawVal = e.target.value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
    const parts = rawVal.split(".");
    if (parts.length > 2) {
      rawVal = parts[0] + "." + parts.slice(1).join("");
    }
    setDoseDisplay(rawVal);
    const parsed = rawVal && rawVal !== "." ? parseFloat(rawVal) : undefined;
    handleStateChange({ doseValue: parsed });
  };

  const getPeriodUnitLabel = (unit: string) => {
    switch (unit) {
      case "d": return "Day";
      case "h": return "Hour";
      case "wk": return "Week";
      case "mo": return "Month";
      default: return unit;
    }
  };

  const autoText = React.useMemo(() => {
    return generateAutoText(state);
  }, [state]);

  return (
    <div className={cn("w-full text-foreground bg-transparent p-0 border-0 shadow-none", className)} {...props}>
      <Field>
        <div className={cn(
          layout === "grid"
            ? "grid grid-cols-1 lg:grid-cols-12 gap-3 items-center w-full"
            : "flex flex-row flex-wrap items-end gap-4 mt-2 w-full"
        )}>
          {layout !== "grid" && showAdvanced && (
            <div className="w-16 shrink-0">
              {showLabel && <Label className="mb-1.5 block text-xs">Seq</Label>}
              <InputGroup className="relative flex w-14 items-center overflow-hidden h-8">
                <InputGroupInput
                  type="text"
                  inputMode="numeric"
                  value={state.sequence}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, "");
                    handleStateChange({ sequence: Number(cleaned) || 1 });
                  }}
                  readOnly={readOnly}
                  disabled={readOnly}
                  className="text-center font-mono h-full border-0 focus-visible:ring-0"
                />
              </InputGroup>
            </div>
          )}

          <div className={cn(layout === "grid" ? "lg:col-span-3" : "flex-1 min-w-[180px]")}>
            {showLabel && <Label className="mb-1.5 block text-xs">Frequency & Period</Label>}
            
            <div className="flex items-center gap-1.5 w-full">
              {layout === "grid" && showAdvanced && (
                <div className="w-10 shrink-0">
                  <InputGroup className="relative flex w-10 items-center overflow-hidden h-8 border border-input rounded-md bg-transparent">
                    <InputGroupInput
                      type="text"
                      inputMode="numeric"
                      value={state.sequence}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^0-9]/g, "");
                        handleStateChange({ sequence: Number(cleaned) || 1 });
                      }}
                      readOnly={readOnly}
                      disabled={readOnly}
                      className="text-center font-mono h-full border-0 focus-visible:ring-0 px-1 text-xs"
                      title="Sequence"
                    />
                  </InputGroup>
                </div>
              )}
              
              <InputGroup className="relative flex w-full items-center overflow-hidden h-8 flex-1">
                {/* Frequency Input */}
                <InputGroupInput
                  type="text"
                  inputMode="numeric"
                  placeholder="Freq"
                  value={freqDisplay}
                  onChange={handleFreqChange}
                  readOnly={readOnly}
                  disabled={readOnly}
                  className="min-w-0 flex-1 h-full border-0 focus-visible:ring-0 text-center disabled:opacity-85 font-mono text-sm"
                />
                
                {/* Separator 'x' */}
                <InputGroupText className="px-3.5 text-muted-foreground select-none flex-none text-xs bg-muted/20 border-x border-border/40 font-semibold font-mono h-full flex items-center justify-center">
                  x
                </InputGroupText>

                {/* Period Input */}
                <InputGroupInput
                  type="text"
                  inputMode="numeric"
                  placeholder="Period"
                  value={periodDisplay}
                  onChange={handlePeriodChange}
                  readOnly={readOnly}
                  disabled={readOnly}
                  className="min-w-0 flex-1 h-full border-0 focus-visible:ring-0 text-center disabled:opacity-85 font-mono text-sm border-r border-border/40"
                />
                
                {/* Period Unit Select Dropdown */}
                <InputGroupAddon align="inline-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <InputGroupButton
                        variant="ghost"
                        aria-label="Select unit"
                        className="font-mono text-xs px-2.5 h-6 flex items-center justify-center disabled:opacity-85"
                        disabled={readOnly}
                      >
                        {getPeriodUnitLabel(state.periodUnit)}
                      </InputGroupButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="max-h-48 overflow-y-auto">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={() => handleStateChange({ periodUnit: "d" })} className="font-sans text-xs">
                          Day
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleStateChange({ periodUnit: "h" })} className="font-sans text-xs">
                          Hour
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleStateChange({ periodUnit: "wk" })} className="font-sans text-xs">
                          Week
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleStateChange({ periodUnit: "mo" })} className="font-sans text-xs">
                          Month
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>

          <div className={cn(layout === "grid" ? "lg:col-span-2" : "flex-1 min-w-[150px]")}>
            {showLabel && <Label className="mb-1.5 block text-xs">Meal Instruction</Label>}
            <Select
              value={state.when || "none"}
              onValueChange={(val) => handleStateChange({ when: val === "none" ? undefined : val })}
              disabled={readOnly}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="none">-</SelectItem>
                <SelectItem value="AC">Before Meals (AC)</SelectItem>
                <SelectItem value="PC">After Meals (PC)</SelectItem>
                <SelectItem value="CC">With Meals (CC)</SelectItem>
                <SelectItem value="HS">Before Sleep (HS)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={cn(layout === "grid" ? "lg:col-span-3" : "flex-1 min-w-[180px]")}>
            {showLabel && <Label className="mb-1.5 block text-xs">Dose Quantity</Label>}
            
            <InputGroup className="relative flex w-full items-center overflow-hidden h-8">
              {/* Dose Value Text Input */}
              <InputGroupInput
                type="text"
                inputMode="decimal"
                placeholder="e.g. 500"
                value={doseDisplay}
                onChange={handleDoseValueChange}
                readOnly={readOnly}
                disabled={readOnly}
                className="min-w-0 flex-1 h-full border-0 focus-visible:ring-0 px-3 disabled:opacity-85 font-mono text-sm border-r border-border/40"
              />
              
              {/* Dose Unit selector dropdown */}
              <InputGroupAddon align="inline-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <InputGroupButton
                      variant="ghost"
                      aria-label="Select dose unit"
                      className="font-mono text-xs px-2.5 h-6 flex items-center justify-center disabled:opacity-85 text-muted-foreground"
                      disabled={readOnly}
                    >
                      {UNIT_OPTIONS[state.doseUnit]?.label || state.doseUnit || "Unit"}
                    </InputGroupButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-48 overflow-y-auto">
                    <DropdownMenuGroup>
                      <DropdownMenuItem onSelect={() => handleStateChange({ doseUnit: "" })} className="font-sans text-xs">
                        -
                      </DropdownMenuItem>
                      {Object.entries(UNIT_OPTIONS).map(([key, opt]) => (
                        <DropdownMenuItem key={key} onSelect={() => handleStateChange({ doseUnit: key })} className="font-sans text-xs">
                          {opt.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </InputGroupAddon>
            </InputGroup>
          </div>

          <div className={cn(layout === "grid" ? "lg:col-span-2" : "flex-1 min-w-[200px]")}>
            {showLabel && <Label className="mb-1.5 block text-xs">Route</Label>}
            <Select
              value={state.routeCode || "none"}
              onValueChange={(val) => {
                const opt = ROUTE_OPTIONS.find((r) => r.code === val);
                handleStateChange({
                  routeCode: val === "none" ? undefined : val,
                  routeDisplay: val === "none" ? undefined : opt?.display,
                });
              }}
              disabled={readOnly}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="none">-</SelectItem>
                {ROUTE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.code} value={opt.code}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={cn(layout === "grid" ? "lg:col-span-1 flex items-center lg:justify-center h-8" : "flex items-center gap-2 h-8 shrink-0")}>
            <Checkbox
              id={`as-needed-checkbox-${state.sequence}`}
              checked={state.asNeeded}
              disabled={readOnly}
              onCheckedChange={(checked) => handleStateChange({ asNeeded: !!checked })}
            />
            {layout !== "grid" && (
              <label
                htmlFor={`as-needed-checkbox-${state.sequence}`}
                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none cursor-pointer whitespace-nowrap"
              >
                As needed
              </label>
            )}
          </div>

          <div className={cn(layout === "grid" ? "lg:col-span-1 flex items-center justify-end h-8" : "flex items-center h-8 shrink-0")}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(
                "h-8 w-8 text-muted-foreground hover:text-foreground",
                showAdvanced && "bg-muted text-foreground"
              )}
              title={showAdvanced ? "Less Options" : "More Options"}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showAdvanced && (
          <div className="mt-3 w-full">
            {showLabel && <Label className="mb-1.5 block text-xs">Instruction Text (Optional Override)</Label>}
            <InputGroup className="relative flex w-full items-center overflow-hidden h-8">
              <InputGroupInput
                type="text"
                placeholder={autoText || "Override auto-generated instruction text..."}
                value={hasManualOverride ? state.text : ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const active = val.trim() !== "";
                  setHasManualOverride(active);
                  handleStateChange({ text: val }, active);
                }}
                readOnly={readOnly}
                disabled={readOnly}
                className="h-full border-0 focus-visible:ring-0 px-3"
              />
            </InputGroup>
          </div>
        )}
      </Field>
    </div>
  );

}
