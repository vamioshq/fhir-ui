"use client";

import * as React from "react";
import { type Reference } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
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
 * Location physical types according to FHIR and healthcare standards
 */
export type LocationPhysicalType =
  | "building"  // Building
  | "ward"      // Ward
  | "floor"     // Floor
  | "room"      // Room
  | "bed"       // Bed
  | "clinic"    // Klinik
  | "department" // Department/Poliklinik
  | "icu"       // ICU
  | "er"        // IGD/ER
  | "or"        // Operating Room
  | "pharmacy"; // Apotek

/**
 * Location mode of operation
 */
export type LocationMode =
  | "instance"  // Specific location (e.g., Bed 123)
  | "kind";      // Type of location (e.g., Any ICU Bed)

/**
 * Represents a healthcare location from Satusehat
 */
export interface LocationItem {
  id: string; // Location ID
  name: string; // Location name (e.g., "ICU Room 1", "Bed 123")
  description?: string; // Optional description
  physicalType?: LocationPhysicalType; // Building, ward, room, bed, etc.
  mode?: LocationMode; // Instance or kind
  organizationId?: string; // Parent organization/facility
  organizationName?: string; // Parent organization name for display
  parentId?: string; // Parent location (for hierarchy)
  parentName?: string; // Parent location name for display
  status?: "active" | "suspended" | "inactive"; // Location status
  display?: string; // Optional display text
}

/**
 * Props for FHIRLocationInput
 */
export interface FHIRLocationInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Currently selected location as FHIR Reference */
  value?: Reference;
  /** Called when location selection changes */
  onChange?: (value: Reference) => void;
  /** Label for the input field */
  label?: string;
  /** Description text */
  description?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Filter by physical type */
  physicalType?: LocationPhysicalType;
  /** Filter by parent organization ID */
  organizationId?: string;
  /** Filter by parent location ID */
  parentLocationId?: string;
  /** Only show active locations */
  activeOnly?: boolean;
  /** Async search handler for fetching locations */
  onSearch?: (query: string, filters?: {
    physicalType?: LocationPhysicalType;
    organizationId?: string;
    parentLocationId?: string;
    activeOnly?: boolean;
  }) => Promise<LocationItem[]>;
  /** Static options (if not using async search) */
  options?: LocationItem[];
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Physical type labels for display
 */
const PHYSICAL_TYPE_LABELS: Record<LocationPhysicalType, string> = {
  "building": "Gedung",
  "ward": "Ruang Rawat Inap",
  "floor": "Lantai",
  "room": "Kamar",
  "bed": "Tempat Tidur",
  "clinic": "Klinik",
  "department": "Poliklinik",
  "icu": "ICU",
  "er": "IGD",
  "or": "OK",
  "pharmacy": "Apotek",
};

/**
 * Converts LocationItem to FHIR Reference format
 */
function locationToReference(item: LocationItem): Reference {
  const ref: Reference = {
    reference: `Location/${item.id}`,
    display: item.display || item.name,
  };

  if (item.description) {
    ref.display = `${item.name} - ${item.description}`;
  }

  return ref;
}

/**
 * Extracts location ID from FHIR Reference
 */
function getLocationId(ref?: Reference): string {
  if (!ref) return "";
  if (ref.reference) {
    return ref.reference.replace("Location/", "") || "";
  }
  return "";
}

export function FHIRLocationInput({
  value,
  onChange,
  label = "Lokasi Fasilitas",
  description,
  placeholder = "Cari lokasi (ruangan, tempat tidur, dll)...",
  physicalType,
  organizationId,
  parentLocationId,
  activeOnly = true,
  onSearch,
  options = [],
  disabled = false,
  className,
  ...props
}: FHIRLocationInputProps) {
  const [internalOptions, setInternalOptions] = React.useState<LocationItem[]>(options);
  const [inputValue, setInputValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const activeLocationId = getLocationId(value);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- inputValue is intentionally omitted to avoid overwriting typed input value on parent state updates
  }, [value]);

  // Handle search with debounce
  const handleInputChange = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (!onSearch) return;

    setLoading(true);
    try {
      const results = await onSearch(val, { physicalType, organizationId, parentLocationId, activeOnly });
      setInternalOptions(results);
    } catch (err) {
      console.error("Failed to search locations:", err);
      setInternalOptions([]);
    } finally {
      setLoading(false);
    }
  }, [onSearch, physicalType, organizationId, parentLocationId, activeOnly]);

  // Handle selection change
  const handleValueChange = (newId: string | string[]) => {
    const idStr = Array.isArray(newId) ? newId[0] : newId;
    if (!idStr) return;

    const selected = internalOptions.find((opt) => opt.id === idStr);

    if (selected && onChange) {
      onChange(locationToReference(selected));
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
      onSearch("", { physicalType, organizationId, parentLocationId, activeOnly })
        .then((results) => setInternalOptions(results))
        .catch((err) => {
          console.error("Failed to load initial locations:", err);
          setInternalOptions([]);
        })
        .finally(() => setLoading(false));
    }
  };

  const renderPhysicalTypeBadge = (type?: LocationPhysicalType) => {
    if (!type) return null;
    const label = PHYSICAL_TYPE_LABELS[type] || type;
    return (
      <Badge variant="secondary" className="text-[10px] uppercase h-5 px-1.5">
        {label}
      </Badge>
    );
  };

  const renderStatusBadge = (status?: string) => {
    if (!status) return null;
    const isActive = status === "active";
    return (
      <Badge
        variant={isActive ? "default" : "secondary"}
        className="text-[10px] uppercase h-5 px-1.5"
      >
        {status === "active" ? "Aktif" : status === "suspended" ? "Ditangguhkan" : "Tidak Aktif"}
      </Badge>
    );
  };

  return (
    <div className={cn("w-full max-w-md text-foreground", className)} {...props}>
      <Field>
        {label && <FieldLabel>{label}</FieldLabel>}
        <Combobox
          value={activeLocationId}
          onValueChange={handleValueChange as any}
          open={open}
          onOpenChange={handleOpenChange}
          disabled={disabled}
        >
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 z-10" />
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
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">
                        {opt.display || opt.name}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {renderPhysicalTypeBadge(opt.physicalType)}
                        {renderStatusBadge(opt.status)}
                      </div>
                    </div>
                    {(opt.description || opt.organizationName || opt.parentName) && (
                      <span className="text-xs text-muted-foreground truncate">
                        {opt.description && (
                          <span className="mr-2">{opt.description}</span>
                        )}
                        {opt.organizationName && (
                          <span className="mr-2">🏥 {opt.organizationName}</span>
                        )}
                        {opt.parentName && (
                          <span>↪ {opt.parentName}</span>
                        )}
                      </span>
                    )}
                  </div>
                </ComboboxItem>
              ))}

              {internalOptions.length === 0 && (
                <ComboboxEmpty>
                  {loading ? "Mencari..." : "Tidak ada lokasi ditemukan."}
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
