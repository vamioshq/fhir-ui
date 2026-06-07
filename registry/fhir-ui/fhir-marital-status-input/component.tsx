"use client";

import * as React from "react";
import { type CodeableConcept } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ButtonGroupSeparator } from "@/components/ui/button-group";

export interface FHIRMaritalStatusInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "value"> {
  value?: CodeableConcept;
  onChange?: (value: CodeableConcept) => void;
  variant?: "toggle" | "select";
  showLabel?: boolean;
  label?: string;
  readOnly?: boolean;
}

interface MaritalOption {
  code: string;
  display: string;
  label: string;
}

const MARITAL_OPTIONS: MaritalOption[] = [
  { code: "S", display: "Never Married", label: "Belum Kawin" },
  { code: "M", display: "Married", label: "Kawin" },
  { code: "D", display: "Divorced", label: "Cerai Hidup" },
  { code: "W", display: "Widowed", label: "Cerai Mati" },
];

const MARITAL_SYSTEM = "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus";

export function FHIRMaritalStatusInput({
  value,
  onChange,
  variant = "toggle",
  showLabel = false,
  label = "Marital Status",
  readOnly = false,
  className,
  ...props
}: FHIRMaritalStatusInputProps) {
  // Extract active code from CodeableConcept
  const activeCode = React.useMemo(() => {
    return value?.coding?.[0]?.code || "";
  }, [value]);

  const handleValueChange = (code: string) => {
    if (readOnly || !onChange) return;

    const matched = MARITAL_OPTIONS.find((opt) => opt.code === code);
    if (!matched) return;

    const concept: CodeableConcept = {
      coding: [
        {
          system: MARITAL_SYSTEM,
          code: matched.code,
          display: matched.display,
        },
      ],
      text: matched.display,
    };

    onChange(concept);
  };

  return (
    <div className={cn("w-full flex flex-col gap-2", className)} {...props}>
      {showLabel && <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>}

      {variant === "toggle" ? (
        <ToggleGroup
          type="single"
          value={activeCode}
          onValueChange={handleValueChange}
          disabled={readOnly}
          className="flex flex-row items-center border border-input rounded-lg overflow-hidden w-fit gap-0 bg-transparent h-8"
        >
          {MARITAL_OPTIONS.map((opt, idx) => (
            <React.Fragment key={opt.code}>
              {idx > 0 && <ButtonGroupSeparator className="bg-input" />}
              <ToggleGroupItem
                value={opt.code}
                aria-label={`Select ${opt.label}`}
                className="h-full rounded-none border-0 px-3 hover:bg-muted/50 hover:text-foreground font-medium text-xs transition-all outline-none data-[state=on]:bg-muted data-[state=on]:text-muted-foreground"
              >
                <span>{opt.label}</span>
              </ToggleGroupItem>
            </React.Fragment>
          ))}
        </ToggleGroup>
      ) : (
        <Select
          value={activeCode || "none"}
          onValueChange={(val) => handleValueChange(val === "none" ? "" : val)}
          disabled={readOnly}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Marital Status" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="none">Select Marital Status</SelectItem>
            {MARITAL_OPTIONS.map((opt) => (
              <SelectItem key={opt.code} value={opt.code}>
                {opt.label} ({opt.display})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
