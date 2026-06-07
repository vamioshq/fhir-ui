"use client";

import * as React from "react";
import { type CodeableConcept, type Coding } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";

export const SATUSEHAT_SYSTEMS: Record<string, { label: string }> = {
  "http://hl7.org/fhir/sid/icd-10": {
    label: "ICD-10",
  },
  "http://sys-ids.kemkes.go.id/kfa": {
    label: "KFA",
  },
  "http://loinc.org": {
    label: "LOINC",
  },
  "http://snomed.info/sct": {
    label: "SNOMED",
  },
};

export interface ConceptPresetConfig {
  label: string;
  system: string;
  placeholder: string;
}

export const CONCEPT_PRESETS: Record<string, ConceptPresetConfig> = {
  icd10: {
    label: "ICD-10 Diagnosis",
    system: "http://hl7.org/fhir/sid/icd-10",
    placeholder: "Search ICD-10 (e.g. A00.0)",
  },
  kfa: {
    label: "KFA (Kamus Farmasi & Alkes)",
    system: "http://sys-ids.kemkes.go.id/kfa",
    placeholder: "Search medication or device...",
  },
  loinc: {
    label: "LOINC (Observation/Lab)",
    system: "http://loinc.org",
    placeholder: "Search LOINC code...",
  },
  snomed: {
    label: "SNOMED CT",
    system: "http://snomed.info/sct",
    placeholder: "Search SNOMED CT...",
  },
};

export interface FHIRCodeableConceptInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: CodeableConcept;
  onChange?: (value: CodeableConcept) => void;
  preset?: keyof typeof CONCEPT_PRESETS;
  label?: string;
  description?: string;
  placeholder?: string;
  options?: CodeableConcept[];
  onSearch?: (query: string, system?: string) => Promise<CodeableConcept[]>;
  system?: string; // Optional default system
}

export function FHIRCodeableConceptInput({
  value,
  onChange,
  preset,
  label,
  description,
  placeholder,
  options = [],
  onSearch,
  system,
  className,
  ...props
}: FHIRCodeableConceptInputProps) {
  const activePreset = preset ? CONCEPT_PRESETS[preset] : undefined;
  const activeSystem = activePreset?.system || system;
  const activeLabel = label || activePreset?.label || "Concept";
  const activePlaceholder = placeholder || activePreset?.placeholder || "Search...";

  const [internalOptions, setInternalOptions] = React.useState<CodeableConcept[]>(options);
  const [inputValue, setInputValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Derive active code for Combobox value (Base UI requires string values)
  const activeCode = value?.coding?.[0]?.code || "";

  const initialFetchDone = React.useRef(false);

  React.useEffect(() => {
    if (options.length > 0) {
      setInternalOptions(options);
    }
  }, [options]);

  React.useEffect(() => {
    if (onSearch && !initialFetchDone.current) {
      initialFetchDone.current = true;
      setLoading(true);
      onSearch("", activeSystem)
        .then((results) => setInternalOptions(results))
        .catch((err) => console.error("Initial search failed:", err))
        .finally(() => setLoading(false));
    }
  }, [onSearch, activeSystem]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (onSearch) {
      setLoading(true);
      try {
        const results = await onSearch(val, activeSystem);
        setInternalOptions(results);
      } catch (err) {
        console.error("Failed to search concepts:", err);
      } finally {
        setLoading(false);
      }
    } else if (!onSearch && val.trim().length === 0) {
      setInternalOptions(options);
    }
  };

  const handleValueChange = (newCode: string | string[]) => {
    const codeStr = Array.isArray(newCode) ? newCode[0] : newCode;
    const selected = internalOptions.find((opt) => opt.coding?.[0]?.code === codeStr);

    if (selected && onChange) {
      onChange(selected);
      // Optional: Update input value to selected display text
      setInputValue(selected.coding?.[0]?.display || selected.text || codeStr || "");
    }
  };

  const renderBadge = (itemSys?: string) => {
    // If the component is locked to a specific system, showing the badge is redundant.
    if (!itemSys || activeSystem) return null;
    const meta = SATUSEHAT_SYSTEMS[itemSys];
    if (!meta) return null;
    return (
      <Badge
        variant="outline"
      >
        {meta.label}
      </Badge>
    );
  };

  return (
    <div className={cn("w-full max-w-md text-foreground", className)} {...props}>
      <Field>
        {activeLabel && <FieldLabel>{activeLabel}</FieldLabel>}
        <Combobox
          value={activeCode}
          onValueChange={handleValueChange as any} // base-ui onValueChange
        >
          <ComboboxInput
            placeholder={activePlaceholder}
            value={inputValue}
            onChange={handleInputChange}
          >
            <ComboboxContent>
              <ComboboxList>
                {internalOptions.map((opt, i) => {
                  const coding = opt.coding?.[0];
                  if (!coding || !coding.code) return null;

                  const uniqueKey = `${coding.code}-${i}`;

                  return (
                    <ComboboxItem
                      key={uniqueKey}
                      value={coding.code}
                    >
                      <div className="flex flex-col gap-1 w-full text-left py-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {coding.display || opt.text || coding.code}
                          </span>
                          {renderBadge(coding.system)}
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {coding.code}
                        </span>
                      </div>
                    </ComboboxItem>
                  );
                })}

                {internalOptions.length === 0 && (
                  <ComboboxEmpty>
                    {loading ? "Searching..." : "No concept found."}
                  </ComboboxEmpty>
                )}
              </ComboboxList>
            </ComboboxContent>
          </ComboboxInput>
        </Combobox>
        {description && <FieldDescription>{description}</FieldDescription>}
      </Field>
    </div>
  );
}
