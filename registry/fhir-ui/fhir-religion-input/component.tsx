"use client";

import * as React from "react";
import { type Extension } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ButtonGroupSeparator } from "@/components/ui/button-group";

export interface FHIRReligionInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "value"> {
  value?: Extension;
  onChange?: (value: Extension) => void;
  variant?: "toggle" | "select";
  showLabel?: boolean;
  label?: string;
  readOnly?: boolean;
}

interface ReligionOption {
  code: string;
  display: string;
}

const RELIGION_OPTIONS: ReligionOption[] = [
  { code: "1", display: "Islam" },
  { code: "2", display: "Protestan" },
  { code: "3", display: "Katolik" },
  { code: "4", display: "Hindu" },
  { code: "5", display: "Buddha" },
  { code: "6", display: "Khonghucu" },
  { code: "7", display: "Penghayat Kepercayaan" },
  { code: "8", display: "Lainnya" },
];

const RELIGION_EXTENSION_URL = "https://fhir.kemkes.go.id/r4/StructureDefinition/patient-religion";
const RELIGION_SYSTEM = "http://terminology.kemkes.go.id/CodeSystem/religion";

export function FHIRReligionInput({
  value,
  onChange,
  variant = "select", // select is default because there are 6 options, but toggle is also supported
  showLabel = false,
  label = "Religion",
  readOnly = false,
  className,
  ...props
}: FHIRReligionInputProps) {
  // Extract active code from Extension
  const activeCode = React.useMemo(() => {
    return value?.valueCodeableConcept?.coding?.[0]?.code || "";
  }, [value]);

  const handleValueChange = (code: string) => {
    if (readOnly || !onChange) return;

    const matched = RELIGION_OPTIONS.find((opt) => opt.code === code);
    if (!matched) return;

    const extension: Extension = {
      url: RELIGION_EXTENSION_URL,
      valueCodeableConcept: {
        coding: [
          {
            system: RELIGION_SYSTEM,
            code: matched.code,
            display: matched.display,
          },
        ],
        text: matched.display,
      },
    };

    onChange(extension);
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
          className="flex flex-row flex-wrap items-center border border-input rounded-lg overflow-hidden w-fit gap-0 bg-transparent h-auto min-h-8"
        >
          {RELIGION_OPTIONS.map((opt, idx) => (
            <React.Fragment key={opt.code}>
              {idx > 0 && <ButtonGroupSeparator className="bg-input h-8 self-center" />}
              <ToggleGroupItem
                value={opt.code}
                aria-label={`Select ${opt.display}`}
                className="h-8 rounded-none border-0 px-3 hover:bg-muted/50 hover:text-foreground font-medium text-xs transition-all outline-none data-[state=on]:bg-muted data-[state=on]:text-muted-foreground"
              >
                <span>{opt.display}</span>
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
            <SelectValue placeholder="Select Religion" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="none">Select Religion</SelectItem>
            {RELIGION_OPTIONS.map((opt) => (
              <SelectItem key={opt.code} value={opt.code}>
                {opt.display}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
