"use client";

import * as React from "react";
import { type Reference } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";
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
import { Loader2Icon } from "lucide-react";

/**
 * Facility types according to Satusehat classification
 * @see https://satusehat.kemkes.go.id/platform/docs/
 */
export type FacilityType =
  | "hospital" // Rumah Sakit
  | "clinic" // Klinik
  | "puskesmas" // Pusat Kesehatan Masyarakat
  | "pharmacy" // Apotek
  | "lab" // Laboratorium
  | "doctor-practice" // Praktik Mandiri Dokter
  | "blood-unit" // Unit Transfusi Darah
  | "optical"; // Kacamata/Opthalmolog

/**
 * Organization part hierarchy (administrative division)
 * First digit = island group, rest = province/district code
 */
export type OrganizationPart = string; // e.g., "31" for DKI Jakarta

/**
 * Represents a healthcare organization from Satusehat
 */
export interface OrganizationItem {
  id: string; // Organization ID (SSFK code or internal ID)
  name: string; // Organization name
  identifier?: string; // SSFK (Satu Sehat Fasilitas Kesehatan) code
  part?: OrganizationPart; // Administrative division code
  facilityType?: FacilityType;
  display?: string; // Optional display text
}

/**
 * Props for FHIROrganizationInput
 */
export interface FHIROrganizationInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Currently selected organization as FHIR Reference */
  value?: Reference;
  /** Called when organization selection changes */
  onChange?: (value: Reference) => void;
  /** Label for the input field */
  label?: string;
  /** Description text */
  description?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Filter by facility type */
  facilityType?: FacilityType;
  /** Filter by administrative division (part) */
  part?: OrganizationPart;
  /** Async search handler for fetching organizations */
  onSearch?: (query: string, filters?: { facilityType?: FacilityType; part?: OrganizationPart }) => Promise<OrganizationItem[]>;
  /** Static options (if not using async search) */
  options?: OrganizationItem[];
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Converts OrganizationItem to FHIR Reference format
 */
function organizationToReference(item: OrganizationItem): Reference {
  const ref: Reference = {
    reference: `Organization/${item.id}`,
    display: item.display || item.name,
  };

  if (item.identifier) {
    ref.identifier = {
      system: "https://fhir.kemkes.go.id/id/ssfk",
      value: item.identifier,
    };
  }

  return ref;
}

/**
 * Extracts organization ID from FHIR Reference
 */
function getOrganizationId(ref?: Reference): string {
  if (!ref) return "";
  if (ref.reference) {
    return ref.reference.replace("Organization/", "") || "";
  }
  if (ref.identifier?.value) {
    return ref.identifier.value;
  }
  return "";
}

/**
 * Facility type labels for display
 */
const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  "hospital": "Rumah Sakit",
  "clinic": "Klinik",
  "puskesmas": "Puskesmas",
  "pharmacy": "Apotek",
  "lab": "Laboratorium",
  "doctor-practice": "Praktik Dokter",
  "blood-unit": "UTD",
  "optical": "Optik",
};

export function FHIROrganizationInput({
  value,
  onChange,
  label = "Fasilitas Kesehatan",
  description,
  placeholder = "Cari nama fasilitas kesehatan...",
  facilityType,
  part,
  onSearch,
  options = [],
  disabled = false,
  className,
  ...props
}: FHIROrganizationInputProps) {
  const [internalOptions, setInternalOptions] = React.useState<OrganizationItem[]>(options);
  const [inputValue, setInputValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const activeOrgId = getOrganizationId(value);

  // Sync options when static options change
  React.useEffect(() => {
    if (options.length > 0 && !onSearch) {
      setInternalOptions(options);
    }
  }, [options, onSearch]);

  // Set initial input value from selected reference
  React.useEffect(() => {
    if (value?.display && !inputValue) {
      setInputValue(value.display);
    }
  }, [value]);

  // Handle search with debounce
  const handleInputChange = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (!onSearch) return;

    setLoading(true);
    try {
      const results = await onSearch(val, { facilityType, part });
      setInternalOptions(results);
    } catch (err) {
      console.error("Failed to search organizations:", err);
      setInternalOptions([]);
    } finally {
      setLoading(false);
    }
  }, [onSearch, facilityType, part]);

  // Handle selection change
  const handleValueChange = (newId: string | string[]) => {
    const idStr = Array.isArray(newId) ? newId[0] : newId;
    if (!idStr) return;

    const selected = internalOptions.find((opt) => opt.id === idStr || opt.identifier === idStr);

    if (selected && onChange) {
      onChange(organizationToReference(selected));
      setInputValue(selected.display || selected.name);
      setOpen(false);
    }
  };

  // Handle open/close
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen && onSearch) {
      // Load initial results when opening
      setLoading(true);
      onSearch("", { facilityType, part })
        .then((results) => setInternalOptions(results))
        .catch((err) => {
          console.error("Failed to load initial organizations:", err);
          setInternalOptions([]);
        })
        .finally(() => setLoading(false));
    }
  };

  const renderFacilityBadge = (type?: FacilityType) => {
    if (!type) return null;
    return (
      <Badge variant="secondary" className="text-[10px] uppercase h-5 px-1.5">
        {FACILITY_TYPE_LABELS[type] || type}
      </Badge>
    );
  };

  return (
    <div className={cn("w-full max-w-md text-foreground", className)} {...props}>
      <Field>
        {label && <FieldLabel>{label}</FieldLabel>}
        <Combobox
          value={activeOrgId}
          onValueChange={handleValueChange as any}
          open={open}
          onOpenChange={handleOpenChange}
          disabled={disabled}
        >
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 z-10" />
            <ComboboxInput
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInputChange}
              className="pl-9"
              disabled={disabled}
            />
            {loading && (
              <Loader2Icon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" />
            )}
          </div>
          <ComboboxContent>
            <ComboboxList>
              {internalOptions.map((opt) => (
                <ComboboxItem
                  key={opt.id}
                  value={opt.id}
                >
                  <div className="flex flex-col gap-1 w-full text-left py-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {opt.display || opt.name}
                      </span>
                      {renderFacilityBadge(opt.facilityType)}
                    </div>
                    {(opt.identifier || opt.part) && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {opt.identifier && `SSFK: ${opt.identifier}`}
                        {opt.identifier && opt.part && " • "}
                        {opt.part && `Part: ${opt.part}`}
                      </span>
                    )}
                  </div>
                </ComboboxItem>
              ))}

              {internalOptions.length === 0 && (
                <ComboboxEmpty>
                  {loading ? "Mencari..." : "Tidak ada fasilitas kesehatan ditemukan."}
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
