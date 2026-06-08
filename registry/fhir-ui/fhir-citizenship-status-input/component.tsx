"use client";

import * as React from "react";
import { type Extension } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ButtonGroupSeparator } from "@/components/ui/button-group";

export type CitizenshipStatus = "WNI" | "WNA";

const CITIZENSHIP_OPTIONS: Array<{ value: CitizenshipStatus; label: string }> = [
  { value: "WNI", label: "WNI" },
  { value: "WNA", label: "WNA" },
];

export interface FHIRCitizenshipStatusInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: Extension;
  onChange?: (value: Extension) => void;
  variant?: "toggle" | "select";
  showLabel?: boolean;
  label?: string;
  readOnly?: boolean;
}

function buildCitizenshipStatusExtension(status: CitizenshipStatus): Extension {
  return {
    url: "https://fhir.kemkes.go.id/r4/StructureDefinition/citizenshipStatus",
    valueCode: status,
  };
}

function parseStatusFromValue(value?: Extension): CitizenshipStatus {
  if (!value?.valueCode) return "WNI";
  if (value.valueCode === "WNA") return "WNA";
  return "WNI";
}

export function FHIRCitizenshipStatusInput({
  value,
  onChange,
  variant = "toggle",
  showLabel = false,
  label = "Citizenship Status",
  readOnly = false,
  className,
  ...props
}: FHIRCitizenshipStatusInputProps) {
  const [status, setStatus] = React.useState<CitizenshipStatus>(
    parseStatusFromValue(value)
  );

  // Sync state if incoming value prop changes
  React.useEffect(() => {
    setStatus(parseStatusFromValue(value));
  }, [value]);

  const handleValueChange = (newStatus: CitizenshipStatus) => {
    if (readOnly) return;
    setStatus(newStatus);
    if (onChange) {
      onChange(buildCitizenshipStatusExtension(newStatus));
    }
  };

  return (
    <div className={cn("w-full flex flex-col gap-2", className)} {...props}>
      {showLabel && <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>}

      {variant === "toggle" ? (
        <ToggleGroup
          type="single"
          value={status}
          onValueChange={(val) => val && handleValueChange(val as CitizenshipStatus)}
          disabled={readOnly}
          className="flex flex-row items-center border border-input rounded-lg overflow-hidden w-fit gap-0 bg-transparent h-8"
        >
          {CITIZENSHIP_OPTIONS.map((opt, idx) => (
            <React.Fragment key={opt.value}>
              {idx > 0 && <ButtonGroupSeparator className="bg-input" />}
              <ToggleGroupItem
                value={opt.value}
                aria-label={`Select ${opt.label}`}
                className="h-full rounded-none border-0 px-3 hover:bg-muted/50 hover:text-foreground font-medium text-xs transition-all outline-none"
              >
                <span>{opt.label}</span>
              </ToggleGroupItem>
            </React.Fragment>
          ))}
        </ToggleGroup>
      ) : (
        <Select
          value={status}
          onValueChange={handleValueChange}
          disabled={readOnly}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue placeholder="Select citizenship status" />
          </SelectTrigger>
          <SelectContent>
            {CITIZENSHIP_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
