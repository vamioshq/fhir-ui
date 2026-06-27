"use client";

import * as React from "react";
import { type Identifier } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { validateIhsId, validateBpjsNumber } from "@/lib/satusehat-validation";
import { SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel, FieldDescription, FieldSet, FieldLegend } from "@/components/ui/field";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "@/components/ui/input-group";

export interface PresetConfig {
  label: string;
  system: string;
  systemName: string;
  placeholder: string;
  validate: (val: string) => boolean;
  format?: (val: string) => string;
}

export const IDENTIFIER_PRESETS: Record<string, PresetConfig> = {
  nik: {
    label: "NIK (KTP)",
    system: "https://fhir.kemkes.go.id/id/nik",
    systemName: "NIK",
    placeholder: "16-digit National ID (e.g. 3174...)",
    validate: (val) => /^\d{16}$/.test(val),
    format: (val) => val.replace(/\D/g, "").slice(0, 16),
  },
  "nik-ibu": {
    label: "NIK Ibu (Mother's NIK)",
    system: "https://fhir.kemkes.go.id/id/nik-ibu",
    systemName: "NIK Ibu",
    placeholder: "16-digit Mother's National ID",
    validate: (val) => /^\d{16}$/.test(val),
    format: (val) => val.replace(/\D/g, "").slice(0, 16),
  },
  ihs: {
    label: "SATUSEHAT ID (Patient)",
    system: "https://fhir.kemkes.go.id/id/ihs-number",
    systemName: "IHS",
    placeholder: "e.g. P02478375538",
    validate: validateIhsId,
    format: (val) => val.replace(/[^P0\d]/g, "").toUpperCase().slice(0, 12),
  },
  nakes: {
    label: "SATUSEHAT ID (Practitioner)",
    system: "https://fhir.kemkes.go.id/id/nakes-his-number",
    systemName: "Nakes",
    placeholder: "e.g. 1000000001",
    validate: (val) => /^\d{10}$/.test(val.trim()),
    format: (val) => val.replace(/\D/g, "").slice(0, 10),
  },
  bpjs: {
    label: "BPJS Kesehatan",
    system: "https://fhir.kemkes.go.id/id/bpjs-kesehatan",
    systemName: "BPJS",
    placeholder: "13-digit BPJS card number (e.g. 0001260979209)",
    validate: validateBpjsNumber,
    format: (val) => val.replace(/\D/g, "").slice(0, 13),
  },
  str: {
    label: "STR (Medical License)",
    system: "https://fhir.kemkes.go.id/id/str",
    systemName: "STR",
    placeholder: "16-digit STR registration number",
    validate: (val) => /^[a-zA-Z0-9]{16}$/.test(val),
    format: (val) => val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 16),
  },
  sip: {
    label: "SIP (Practice License)",
    system: "https://fhir.kemkes.go.id/id/sip",
    systemName: "SIP",
    placeholder: "Practice License Number (e.g. 440/...) ",
    validate: (val) => val.trim().length > 0,
  },
  paspor: {
    label: "Paspor (Passport)",
    system: "https://fhir.kemkes.go.id/id/paspor",
    systemName: "Paspor",
    placeholder: "Passport Number",
    validate: (val) => /^[a-zA-Z0-9]{6,12}$/.test(val),
    format: (val) => val.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12),
  },
};

export interface FHIRIdentifierInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: Identifier;
  onChange?: (value: Identifier) => void;
  preset?: keyof typeof IDENTIFIER_PRESETS;
  label?: string;
  variant?: "simple" | "detailed";
  description?: string;
  placeholder?: string;
  system?: string; // custom fallback system
  systemName?: string; // custom prefix name
}

export function FHIRIdentifierInput({
  value,
  onChange,
  preset,
  label,
  variant = "simple",
  description,
  placeholder,
  system: propSystem,
  systemName: propSystemName,
  className,
  ...props
}: FHIRIdentifierInputProps) {
  // Resolve active preset configuration
  const activePreset = preset ? IDENTIFIER_PRESETS[preset] : undefined;

  // Derive system details
  const activeSystem = activePreset?.system || propSystem || value?.system || "";
  const activeSystemName = activePreset?.systemName || propSystemName || (activeSystem ? activeSystem.split("/").pop() : "ID");
  const activePlaceholder = placeholder || activePreset?.placeholder || "Enter identifier value...";

  // State setup
  const [idValue, setIdValue] = React.useState(value?.value || "");
  const [use, setUse] = React.useState<Identifier["use"]>(value?.use || "official");
  const [periodStart, setPeriodStart] = React.useState(value?.period?.start || "");
  const [periodEnd, setPeriodEnd] = React.useState(value?.period?.end || "");
  const [isTouched, setIsTouched] = React.useState(false);

  // Sync state if value prop changes
  React.useEffect(() => {
    if (value) {
      setIdValue(value.value || "");
      setUse(value.use || "official");
      setPeriodStart(value.period?.start || "");
      setPeriodEnd(value.period?.end || "");
    }
  }, [value]);

  // Validation logic
  const isValid = React.useMemo(() => {
    if (!idValue) return true; // Empty value is considered valid for clean slate state
    if (activePreset) {
      return activePreset.validate(idValue);
    }
    return idValue.trim().length > 0;
  }, [idValue, activePreset]);

  const isInvalid = isTouched && idValue && !isValid;

  const updateIdentifier = (
    newVal: string,
    newUse: Identifier["use"],
    newStart: string,
    newEnd: string
  ) => {
    setIdValue(newVal);

    if (!onChange) return;

    // Build standard FHIR Identifier
    const updated: Identifier = {
      use: newUse || undefined,
      type: value?.type, // Keep existing custom type if present
      system: activeSystem || undefined,
      value: newVal || undefined,
      period: (newStart || newEnd)
        ? {
          start: newStart || undefined,
          end: newEnd || undefined,
        }
        : undefined,
    };

    onChange(updated);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (activePreset?.format) {
      val = activePreset.format(val);
    }
    setIdValue(val);
    updateIdentifier(val, use, periodStart, periodEnd);
  };

  const handleBlur = () => {
    setIsTouched(true);
  };

  const handleUseChange = (val: string) => {
    const nextUse = val as Identifier["use"];
    setUse(nextUse);
    updateIdentifier(idValue, nextUse, periodStart, periodEnd);
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPeriodStart(val);
    updateIdentifier(idValue, use, val, periodEnd);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPeriodEnd(val);
    updateIdentifier(idValue, use, periodStart, val);
  };

  const defaultLabel = label || activePreset?.label || `${activeSystemName} Identifier`;

  return (
    <TooltipProvider>
      <div className={cn("w-full max-w-md text-foreground", className)} {...props}>
        {variant === "detailed" ? (
          <FieldSet>
            <FieldLegend className="font-semibold text-sm leading-tight border-b pb-2 w-full">
              {defaultLabel}
            </FieldLegend>

            <div className="grid gap-4 sm:grid-cols-2 mt-2">
              {/* Value Input */}
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="detailed-id-value">Value</FieldLabel>
                <InputGroup>
                  {activeSystemName && (
                    <InputGroupAddon>
                      <InputGroupText className="font-mono text-xs">{activeSystemName}</InputGroupText>
                    </InputGroupAddon>
                  )}
                  <InputGroupInput
                    id="detailed-id-value"
                    placeholder={activePlaceholder}
                    value={idValue}
                    onChange={handleValueChange}
                    onBlur={handleBlur}
                    aria-invalid={isInvalid ? "true" : undefined}
                  />
                </InputGroup>
                {isInvalid && activePreset && (
                  <span className="text-xs text-destructive mt-1 block">
                    Invalid format for {activePreset.label}.
                  </span>
                )}
              </Field>

              {/* Identifier Use */}
              <Field>
                <FieldLabel htmlFor="detailed-id-use">Use Case</FieldLabel>
                <Select value={use || "official"} onValueChange={handleUseChange}>
                  <SelectTrigger id="detailed-id-use" className="w-full">
                    <SelectValue placeholder="Select use" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="official">Official</SelectItem>
                    <SelectItem value="usual">Usual</SelectItem>
                    <SelectItem value="temp">Temporary</SelectItem>
                    <SelectItem value="secondary">Secondary</SelectItem>
                    <SelectItem value="old">Old / Previous</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Start Date */}
              <Field>
                <FieldLabel htmlFor="detailed-id-start">Valid From</FieldLabel>
                <Input
                  id="detailed-id-start"
                  type="date"
                  value={periodStart}
                  onChange={handleStartChange}
                />
              </Field>

              {/* End Date */}
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="detailed-id-end">Valid To</FieldLabel>
                <Input
                  id="detailed-id-end"
                  type="date"
                  value={periodEnd}
                  onChange={handleEndChange}
                />
              </Field>
            </div>
          </FieldSet>
        ) : (
          <Field>
            <FieldLabel htmlFor="simple-id-input">{defaultLabel}</FieldLabel>

            <InputGroup>
              {activeSystemName && (
                <InputGroupAddon>
                  <InputGroupText className="font-mono text-xs select-none">{activeSystemName}</InputGroupText>
                </InputGroupAddon>
              )}
              <InputGroupInput
                id="simple-id-input"
                placeholder={activePlaceholder}
                value={idValue}
                onChange={handleValueChange}
                onBlur={handleBlur}
                aria-invalid={isInvalid ? "true" : undefined}
              />
              <InputGroupAddon align="inline-end">
                <Dialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <InputGroupButton size="icon-xs" variant="ghost" aria-label="Edit identifier meta">
                          <SlidersHorizontal className="size-4" />
                        </InputGroupButton>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">Edit details</TooltipContent>
                  </Tooltip>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Identifier Details</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      {/* Value display */}
                      <Field>
                        <FieldLabel htmlFor="dialog-id-value">Value</FieldLabel>
                        <Input
                          id="dialog-id-value"
                          placeholder={activePlaceholder}
                          value={idValue}
                          onChange={handleValueChange}
                          onBlur={handleBlur}
                          aria-invalid={isInvalid ? "true" : undefined}
                        />
                      </Field>

                      {/* Use Cases */}
                      <Field>
                        <FieldLabel htmlFor="dialog-id-use">Use Case</FieldLabel>
                        <Select value={use || "official"} onValueChange={handleUseChange}>
                          <SelectTrigger id="dialog-id-use" className="w-full">
                            <SelectValue placeholder="Select use" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="official">Official</SelectItem>
                            <SelectItem value="usual">Usual</SelectItem>
                            <SelectItem value="temp">Temporary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="old">Old / Previous</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>

                      <div className="grid gap-4 grid-cols-2">
                        {/* Valid From */}
                        <Field>
                          <FieldLabel htmlFor="dialog-id-start">Valid From</FieldLabel>
                          <Input
                            id="dialog-id-start"
                            type="date"
                            value={periodStart}
                            onChange={handleStartChange}
                          />
                        </Field>

                        {/* Valid To */}
                        <Field>
                          <FieldLabel htmlFor="dialog-id-end">Valid To</FieldLabel>
                          <Input
                            id="dialog-id-end"
                            type="date"
                            value={periodEnd}
                            onChange={handleEndChange}
                          />
                        </Field>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </InputGroupAddon>
            </InputGroup>
            {isInvalid && activePreset ? (
              <span className="text-xs text-destructive mt-1 block">
                Invalid format for {activePreset.label}.
              </span>
            ) : (
              description && <FieldDescription>{description}</FieldDescription>
            )}
          </Field>
        )}
      </div>
    </TooltipProvider>
  );
}
