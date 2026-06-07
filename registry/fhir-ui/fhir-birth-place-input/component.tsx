"use client";

import * as React from "react";
import { type Extension } from "@medplum/fhirtypes";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type BirthPlaceCountry = "Indonesia" | "Luar Negeri";

const COUNTRY_OPTIONS: Array<{ value: BirthPlaceCountry; label: string }> = [
  { value: "Indonesia", label: "Indonesia" },
  { value: "Luar Negeri", label: "Luar Negeri" },
];

export interface FHIRBirthPlaceInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: Extension;
  onChange?: (value: Extension) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  readOnly?: boolean;
}

function buildBirthPlaceExtension(
  city: string,
  country: BirthPlaceCountry
): Extension {
  if (country === "Luar Negeri") {
    // Foreign birth place - no country field
    return {
      url: "https://fhir.kemkes.go.id/r4/StructureDefinition/birthPlace",
      valueAddress: {
        city: city || "",
      },
    };
  }

  // Indonesian birth place
  return {
    url: "https://fhir.kemkes.go.id/r4/StructureDefinition/birthPlace",
    valueAddress: {
      city: city || "",
      country: "ID",
    },
  };
}

function parseCountryFromValue(value?: Extension): BirthPlaceCountry {
  if (!value?.valueAddress?.country) return "Luar Negeri";
  if (value.valueAddress.country !== "ID") return "Luar Negeri";
  return "Indonesia";
}

function parseCityFromValue(value?: Extension): string {
  return value?.valueAddress?.city || "";
}

export function FHIRBirthPlaceInput({
  value,
  onChange,
  label = "Birth Place (Tempat Lahir)",
  description,
  placeholder = "e.g., Bandung, Singapore, etc.",
  readOnly = false,
  className,
  ...props
}: FHIRBirthPlaceInputProps) {
  // Derive current state from value prop
  const country = parseCountryFromValue(value);
  const cityName = parseCityFromValue(value);

  const handleCountryChange = (newCountry: BirthPlaceCountry) => {
    if (onChange) {
      onChange(buildBirthPlaceExtension(cityName, newCountry));
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCityName = e.target.value;
    if (onChange) {
      onChange(buildBirthPlaceExtension(newCityName, country));
    }
  };

  return (
    <div className={cn(className)} {...props}>
      <Field>
        <FieldLabel>{label}</FieldLabel>
        <InputGroup className="relative flex w-full items-center overflow-hidden h-8">
          {/* City Name Input */}
          <InputGroupInput
            type="text"
            placeholder={placeholder}
            value={cityName}
            onChange={handleCityChange}
            readOnly={readOnly}
            disabled={readOnly}
            className="min-w-0 h-full border-0 focus-visible:ring-0 disabled:opacity-85 text-sm"
          />

          {/* Country Dropdown Addon */}
          <InputGroupAddon align="inline-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <InputGroupButton
                  variant="ghost"
                  aria-label="Select country"
                  className="text-xs px-2.5 h-6 flex items-center justify-center disabled:opacity-85"
                  disabled={readOnly}
                >
                  {COUNTRY_OPTIONS.find((c) => c.value === country)?.label}
                </InputGroupButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  {COUNTRY_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onSelect={() => handleCountryChange(opt.value)}
                      className="text-xs"
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </InputGroupAddon>
        </InputGroup>

        {description && <FieldDescription>{description}</FieldDescription>}
      </Field>
    </div>
  );
}
