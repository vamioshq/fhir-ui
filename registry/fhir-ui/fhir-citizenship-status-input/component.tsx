"use client";

import * as React from "react";
import { type Extension } from "@medplum/fhirtypes";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type CitizenshipStatus = "WNI" | "WNA";

const CITIZENSHIP_OPTIONS: Array<{ value: CitizenshipStatus; label: string }> = [
  { value: "WNI", label: "WNI" },
  { value: "WNA", label: "WNA" },
];

export interface FHIRCitizenshipStatusInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: Extension;
  onChange?: (value: Extension) => void;
  label?: string;
  description?: string;
  placeholder?: string;
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
  label = "Citizenship Status",
  description,
  placeholder = "Select citizenship status",
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
    setStatus(newStatus);
    if (onChange) {
      onChange(buildCitizenshipStatusExtension(newStatus));
    }
  };

  return (
    <div className={cn(className)} {...props}>
      <Field>
        <FieldLabel>{label}</FieldLabel>
        <Select
          value={status}
          onValueChange={handleValueChange}
          disabled={readOnly}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {CITIZENSHIP_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {description && <FieldDescription>{description}</FieldDescription>}
      </Field>
    </div>
  );
}
