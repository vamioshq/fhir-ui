"use client";

import * as React from "react";
import { type Reference } from "@medplum/fhirtypes";
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
import { Link2 } from "lucide-react";

export interface FHIRReferenceInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: Reference;
  onChange?: (value: Reference) => void;
  resourceType?: string; // e.g. "Patient", "Practitioner", "Location"
  label?: string;
  description?: string;
  placeholder?: string;
  options?: Reference[];
  onSearch?: (query: string, resourceType?: string) => Promise<Reference[]>;
}

export function FHIRReferenceInput({
  value,
  onChange,
  resourceType,
  label = "Resource Reference",
  description,
  placeholder = "Search resources...",
  options = [],
  onSearch,
  className,
  ...props
}: FHIRReferenceInputProps) {
  const [internalOptions, setInternalOptions] = React.useState<Reference[]>(options);
  const [inputValue, setInputValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // Safely extract a unique key for the combobox value
  const getReferenceKey = (ref?: Reference) => {
    if (!ref) return "";
    return ref.reference || ref.identifier?.value || ref.display || "";
  };

  const activeKey = getReferenceKey(value);

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
      onSearch("", resourceType)
        .then((results) => setInternalOptions(results))
        .catch((err) => console.error("Initial search failed:", err))
        .finally(() => setLoading(false));
    }
  }, [onSearch, resourceType]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (onSearch) {
      setLoading(true);
      try {
        const results = await onSearch(val, resourceType);
        setInternalOptions(results);
      } catch (err) {
        console.error("Failed to search references:", err);
      } finally {
        setLoading(false);
      }
    } else if (!onSearch && val.trim().length === 0) {
      setInternalOptions(options);
    }
  };

  const handleValueChange = (newKey: string | string[]) => {
    const keyStr = Array.isArray(newKey) ? newKey[0] : newKey;
    
    const selected = internalOptions.find(
      (opt) => getReferenceKey(opt) === keyStr
    );

    if (selected && onChange) {
      onChange(selected);
      setInputValue(selected.display || selected.reference || "");
    }
  };

  const renderBadge = (refType?: string) => {
    // If we locked the component to a specific type, showing the badge is redundant.
    if (!refType || resourceType) return null;
    return (
      <Badge variant="outline" className="text-[10px] uppercase h-5 px-1.5">
        {refType}
      </Badge>
    );
  };

  return (
    <div className={cn("w-full max-w-md text-foreground", className)} {...props}>
      <Field>
        {label && <FieldLabel>{label}</FieldLabel>}
        <Combobox
          value={activeKey}
          onValueChange={handleValueChange as any}
        >
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 z-10" />
            <ComboboxInput
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInputChange}
              className="pl-9"
            />
          </div>
          <ComboboxContent>
            <ComboboxList>
              {internalOptions.map((opt, i) => {
                const uniqueKey = getReferenceKey(opt) || `fallback-${i}`;
                const typeText = opt.type || opt.reference?.split("/")[0];
                const subText = opt.reference || opt.identifier?.value || "Unknown ID";

                return (
                  <ComboboxItem
                    key={uniqueKey}
                    value={uniqueKey}
                  >
                    <div className="flex flex-col gap-1 w-full text-left py-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {opt.display || subText}
                        </span>
                        {renderBadge(typeText)}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono truncate">
                        {subText}
                      </span>
                    </div>
                  </ComboboxItem>
                );
              })}

              {internalOptions.length === 0 && (
                <ComboboxEmpty>
                  {loading ? "Searching..." : "No resources found."}
                </ComboboxEmpty>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {description && <FieldDescription>{description}</FieldDescription>}
      </Field>
    </div>
  );
}
