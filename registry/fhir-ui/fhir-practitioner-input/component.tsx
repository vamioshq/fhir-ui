"use client";

import * as React from "react";
import { type Reference } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { UserRound } from "lucide-react";
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
 * Practitioner roles according to healthcare standards
 */
export type PractitionerRole =
  | "doctor"      // Dokter Umum
  | "specialist"  // Dokter Spesialis
  | "dentist"     // Dokter Gigi
  | "nurse"       // Perawat
  | "midwife"     // Bidan
  | "pharmacist"  // Apoteker
  | "nutritionist" // Ahli Gizi
  | "psychologist" // Psikolog
  | "lab-tech"    // Teknisi Laboratorium
  | "radiographer"; // Radiografer

/**
 * Practitioner specialties (for specialist doctors)
 */
export type PractitionerSpecialty =
  | "internal-medicine" // Penyakit Dalam
  | "pediatrics"        // Anak
  | "surgery"           // Bedah
  | "ob-gyn"            // Kandungan
  | "neurology"         // Saraf
  | "cardiology"        // Jantung
  | "pulmonology"       // Paru
  | "dermatology"       // Kulit & Kelamin
  | "ophthalmology"     // Mata
  | "ENT"               // THT
  | "psychiatry"        // Jiwa
  | "anesthesiology";   // Anestesi

/**
 * Represents a healthcare practitioner (Nakes) from Satusehat
 */
export interface PractitionerItem {
  id: string; // Practitioner ID or Nakes ID
  name: string; // Full name
  nakesId?: string; // Satusehat Practitioner ID (N10000001 format)
  nik?: string; // NIK for identification
  role?: PractitionerRole; // Primary role
  specialty?: PractitionerSpecialty; // Specialty (for specialists)
  organizationId?: string; // Primary organization/facility
  organizationName?: string; // Organization name for display
  gender?: "male" | "female" | "other" | "unknown";
  status?: "active" | "inactive" | "suspended"; // Practitioner status
  display?: string; // Optional display text
}

/**
 * Props for FHIRPractitionerInput
 */
export interface FHIRPractitionerInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Currently selected practitioner as FHIR Reference */
  value?: Reference;
  /** Called when practitioner selection changes */
  onChange?: (value: Reference) => void;
  /** Label for the input field */
  label?: string;
  /** Description text */
  description?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Filter by practitioner role */
  role?: PractitionerRole;
  /** Filter by specialty */
  specialty?: PractitionerSpecialty;
  /** Filter by organization ID */
  organizationId?: string;
  /** Only show active practitioners */
  activeOnly?: boolean;
  /** Async search handler for fetching practitioners */
  onSearch?: (query: string, filters?: {
    role?: PractitionerRole;
    specialty?: PractitionerSpecialty;
    organizationId?: string;
    activeOnly?: boolean;
  }) => Promise<PractitionerItem[]>;
  /** Static options (if not using async search) */
  options?: PractitionerItem[];
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Role labels for display
 */
const ROLE_LABELS: Record<PractitionerRole, string> = {
  "doctor": "Dokter Umum",
  "specialist": "Dokter Spesialis",
  "dentist": "Dokter Gigi",
  "nurse": "Perawat",
  "midwife": "Bidan",
  "pharmacist": "Apoteker",
  "nutritionist": "Ahli Gizi",
  "psychologist": "Psikolog",
  "lab-tech": "Teknisi Lab",
  "radiographer": "Radiografer",
};

/**
 * Specialty labels for display
 */
const SPECIALTY_LABELS: Record<PractitionerSpecialty, string> = {
  "internal-medicine": "Sp. Penyakit Dalam",
  "pediatrics": "Sp. Anak",
  "surgery": "Sp. Bedah",
  "ob-gyn": "Sp. Kandungan",
  "neurology": "Sp. Saraf",
  "cardiology": "Sp. Jantung",
  "pulmonology": "Sp. Paru",
  "dermatology": "Sp. Kulit & Kelamin",
  "ophthalmology": "Sp. Mata",
  "ENT": "Sp. THT",
  "psychiatry": "Sp. Jiwa",
  "anesthesiology": "Sp. Anestesi",
};

/**
 * Converts PractitionerItem to FHIR Reference format
 */
function practitionerToReference(item: PractitionerItem): Reference {
  const ref: Reference = {
    reference: `Practitioner/${item.id}`,
    display: item.display || item.name,
  };

  if (item.nakesId) {
    ref.identifier = {
      system: "https://fhir.kemkes.go.id/id/nakes-his-number",
      value: item.nakesId,
    };
  }

  return ref;
}

/**
 * Extracts practitioner ID from FHIR Reference
 */
function getPractitionerId(ref?: Reference): string {
  if (!ref) return "";
  if (ref.reference) {
    return ref.reference.replace("Practitioner/", "") || "";
  }
  if (ref.identifier?.value) {
    return ref.identifier.value;
  }
  return "";
}

export function FHIRPractitionerInput({
  value,
  onChange,
  label = "Tenaga Kesehatan",
  description,
  placeholder = "Cari nama tenaga kesehatan...",
  role,
  specialty,
  organizationId,
  activeOnly = true,
  onSearch,
  options = [],
  disabled = false,
  className,
  ...props
}: FHIRPractitionerInputProps) {
  const [internalOptions, setInternalOptions] = React.useState<PractitionerItem[]>(options);
  const [inputValue, setInputValue] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const activePractitionerId = getPractitionerId(value);

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
      const results = await onSearch(val, { role, specialty, organizationId, activeOnly });
      setInternalOptions(results);
    } catch (err) {
      console.error("Failed to search practitioners:", err);
      setInternalOptions([]);
    } finally {
      setLoading(false);
    }
  }, [onSearch, role, specialty, organizationId, activeOnly]);

  // Handle selection change
  const handleValueChange = (newId: string | string[]) => {
    const idStr = Array.isArray(newId) ? newId[0] : newId;
    if (!idStr) return;

    const selected = internalOptions.find((opt) => opt.id === idStr || opt.nakesId === idStr);

    if (selected && onChange) {
      onChange(practitionerToReference(selected));
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
      onSearch("", { role, specialty, organizationId, activeOnly })
        .then((results) => setInternalOptions(results))
        .catch((err) => {
          console.error("Failed to load initial practitioners:", err);
          setInternalOptions([]);
        })
        .finally(() => setLoading(false));
    }
  };

  const renderRoleBadge = (practitionerRole?: PractitionerRole) => {
    if (!practitionerRole) return null;
    const label = ROLE_LABELS[practitionerRole] || practitionerRole;
    return (
      <Badge variant="secondary" className="text-[10px] uppercase h-5 px-1.5">
        {label}
      </Badge>
    );
  };

  const renderSpecialtyBadge = (practitionerSpecialty?: PractitionerSpecialty) => {
    if (!practitionerSpecialty) return null;
    const label = SPECIALTY_LABELS[practitionerSpecialty] || practitionerSpecialty;
    return (
      <Badge variant="outline" className="text-[10px] uppercase h-5 px-1.5">
        {label}
      </Badge>
    );
  };

  const renderGenderIcon = (gender?: string) => {
    if (!gender) return null;
    return (
      <span className="text-xs text-muted-foreground">
        {gender === "male" ? "👨" : gender === "female" ? "👩" : "🧑"}
      </span>
    );
  };

  return (
    <div className={cn("w-full max-w-md text-foreground", className)} {...props}>
      <Field>
        {label && <FieldLabel>{label}</FieldLabel>}
        <Combobox
          value={activePractitionerId}
          onValueChange={handleValueChange as any}
          open={open}
          onOpenChange={handleOpenChange}
          disabled={disabled}
        >
          <div className="relative">
            <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70 z-10" />
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
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {opt.display || opt.name}
                        </span>
                        {renderGenderIcon(opt.gender)}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {renderSpecialtyBadge(opt.specialty)}
                        {renderRoleBadge(opt.role)}
                      </div>
                    </div>
                    {(opt.nakesId || opt.organizationName) && (
                      <span className="text-xs text-muted-foreground truncate">
                        {opt.nakesId && (
                          <span className="mr-2 font-mono">Nakes: {opt.nakesId}</span>
                        )}
                        {opt.organizationName && (
                          <span>🏥 {opt.organizationName}</span>
                        )}
                      </span>
                    )}
                  </div>
                </ComboboxItem>
              ))}

              {internalOptions.length === 0 && (
                <ComboboxEmpty>
                  {loading ? "Mencari..." : "Tidak ada tenaga kesehatan ditemukan."}
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
