"use client"

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  FHIROdontogramTooth,
  ToothSurface,
  ToothConditionType,
} from "./lib/fhir-odontogram-tooth";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MousePointer2, Eraser } from "lucide-react";

function MiniToothIcon({ condition, className }: { condition: ToolType; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("size-6 shrink-0", className)} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
      {condition === "missing" ? (
        <>
          <path d="M30,35 C30,22 40,22 45,27 C50,22 60,22 60,35 C60,50 70,60 70,75 L20,75 C20,60 30,50 30,35 Z" className="fill-muted stroke-muted-foreground/30 stroke-[4]" />
          <path d="M25,75 C25,90 35,95 40,95 C45,95 45,90 45,85 M65,75 C65,90 55,95 50,95" className="stroke-muted-foreground/30 stroke-[4]" />
          <line x1="15" y1="15" x2="85" y2="85" className="stroke-destructive" strokeWidth="12" />
          <line x1="85" y1="15" x2="15" y2="85" className="stroke-destructive" strokeWidth="12" />
        </>
      ) : condition === "radix" ? (
        <>
          <path d="M30,35 C30,22 40,22 45,27 C50,22 60,22 60,35 C60,50 70,60 70,75 L20,75 C20,60 30,50 30,35 Z" className="stroke-muted-foreground/30 stroke-[4] fill-none" />
          <path d="M25,75 C25,90 35,95 40,95 C45,95 45,90 45,85" className="stroke-destructive stroke-[12]" />
          <path d="M65,75 C65,90 55,95 50,95" className="stroke-destructive stroke-[12]" />
        </>
      ) : condition === "unerupted" ? (
        <>
          <path d="M25,75 C25,90 35,95 40,95 C45,95 45,90 45,85" className="stroke-muted-foreground/60" />
          <path d="M65,75 C65,90 55,95 50,95" className="stroke-muted-foreground/60" />
          <path
            d="M30,35 C30,22 40,22 45,27 C50,22 60,22 60,35 C60,50 70,60 70,75 L20,75 C20,60 30,50 30,35 Z"
            className="fill-background stroke-foreground"
          />
          <circle cx="50" cy="50" r="46" fill="none" className="stroke-amber-500 stroke-[8]" strokeDasharray="12,8" />
        </>
      ) : condition === "fracture" ? (
        <>
          <path d="M25,75 C25,90 35,95 40,95 C45,95 45,90 45,85" className="stroke-muted-foreground/60" />
          <path d="M65,75 C65,90 55,95 50,95" className="stroke-muted-foreground/60" />
          <path
            d="M30,35 C30,22 40,22 45,27 C50,22 60,22 60,35 C60,50 70,60 70,75 L20,75 C20,60 30,50 30,35 Z"
            className="fill-background stroke-foreground"
          />
          {/* Kemenkes Hash (#) symbol in red */}
          <line x1="35" y1="43" x2="65" y2="43" className="stroke-destructive" strokeWidth="8" />
          <line x1="35" y1="57" x2="65" y2="57" className="stroke-destructive" strokeWidth="8" />
          <line x1="43" y1="35" x2="43" y2="65" className="stroke-destructive" strokeWidth="8" />
          <line x1="57" y1="35" x2="57" y2="65" className="stroke-destructive" strokeWidth="8" />
        </>
      ) : condition === "bridge" ? (
        <>
          <path d="M20,65 C20,75 25,80 30,80 C35,80 35,75 35,70" className="stroke-muted-foreground/60 stroke-[6]" />
          <path d="M45,65 C45,75 40,80 40,80" className="stroke-muted-foreground/60 stroke-[6]" />
          <path d="M60,65 C60,75 65,80 70,80 C75,80 75,75 75,70" className="stroke-muted-foreground/60 stroke-[6]" />
          <path d="M85,65 C85,75 80,80 80,80" className="stroke-muted-foreground/60 stroke-[6]" />
          <path d="M22,35 C22,25 30,25 32,28 C35,25 43,25 43,35 C43,45 48,52 48,62 L15,62 C15,52 22,45 22,35 Z" className="fill-background stroke-foreground stroke-[6]" />
          <path d="M57,35 C57,25 65,25 67,28 C70,25 78,25 78,35 C78,45 83,52 83,62 L50,62 C50,52 57,45 57,35 Z" className="fill-background stroke-foreground stroke-[6]" />
          <line x1="10" y1="48" x2="90" y2="48" className="stroke-blue-500 stroke-[12]" />
          <line x1="10" y1="48" x2="90" y2="48" className="stroke-background stroke-[3]" />
        </>
      ) : (
        <>
          {/* Roots */}
          {condition === "root-canal" ? (
            <>
              <path d="M25,75 C25,90 35,95 40,95 C45,95 45,90 45,85" className="stroke-purple-600 stroke-[10]" />
              <path d="M65,75 C65,90 55,95 50,95" className="stroke-purple-600 stroke-[10]" />
            </>
          ) : (
            <>
              <path d="M25,75 C25,90 35,95 40,95 C45,95 45,90 45,85" className="stroke-muted-foreground/60" />
              <path d="M65,75 C65,90 55,95 50,95" className="stroke-muted-foreground/60" />
            </>
          )}

          {/* Main Crown Outline */}
          <path
            d="M30,35 C30,22 40,22 45,27 C50,22 60,22 60,35 C60,50 70,60 70,75 L20,75 C20,60 30,50 30,35 Z"
            className={cn(
              "fill-background stroke-foreground",
              condition === "crown" && "fill-amber-400/20 stroke-amber-500 stroke-[12]"
            )}
          />

          {/* Surface Condition Fill */}
          {condition === "caries" && (
            <circle cx="45" cy="45" r="12" className="fill-destructive stroke-none animate-pulse" />
          )}
          {condition === "amalgam" && (
            <rect x="35" y="38" width="20" height="15" rx="2" className="fill-neutral-800 dark:fill-neutral-400 stroke-none" />
          )}
          {condition === "composite" && (
            <rect x="35" y="38" width="20" height="15" rx="2" className="fill-emerald-600 dark:fill-emerald-400 stroke-none" />
          )}
          {condition === "sealant" && (
            <path d="M32,35 Q45,45 58,35" className="stroke-pink-500 stroke-[12] fill-none" />
          )}
        </>
      )}
    </svg>
  );
}

export interface FHIROdontogramInputProps {
  /**
   * The list of FHIR Resources (Condition, Procedure, Observation) representing the dental chart.
   */
  value?: any[];
  /**
   * Callback fired when a new resource is added to the chart.
   */
  onChange?: (resources: any[]) => void;
  readOnly?: boolean;
  className?: string;
}

export type ToolType =
  | "select"
  | "eraser"
  | "caries"
  | "amalgam"
  | "composite"
  | "crown"
  | "missing"
  | "root-canal"
  | "sealant"
  | "radix"
  | "unerupted"
  | "fracture"
  | "bridge";

const TOOLS: {
  id: ToolType;
  label: string;
  tooltip: string;
  selectedClass: string;
  badgeColor: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "select",
    label: "Select",
    tooltip: "Select / View Mode (Interactive drawing disabled)",
    selectedClass: "border-blue-500/50 bg-blue-500/10 ring-2 ring-blue-500/30",
    badgeColor: "bg-blue-500",
    icon: <MousePointer2 className="size-6 text-muted-foreground" />,
  },
  {
    id: "eraser",
    label: "Eraser",
    tooltip: "Eraser (Click any surface to clear its status)",
    selectedClass: "border-neutral-500/50 bg-neutral-500/10 ring-2 ring-neutral-500/30",
    badgeColor: "bg-neutral-500",
    icon: <Eraser className="size-6 text-muted-foreground" />,
  },
  {
    id: "caries",
    label: "Caries",
    tooltip: "Dental Caries / Decay (Active condition)",
    selectedClass: "border-destructive/50 bg-destructive/10 ring-2 ring-destructive/30",
    badgeColor: "bg-destructive",
    icon: <MiniToothIcon condition="caries" />,
  },
  {
    id: "amalgam",
    label: "Amalgam",
    tooltip: "Amalgam Filling (Silver restoration)",
    selectedClass: "border-neutral-800/50 bg-neutral-800/10 ring-2 ring-neutral-800/30 dark:border-neutral-200/50 dark:bg-neutral-200/10 dark:ring-2 dark:ring-neutral-200/30",
    badgeColor: "bg-neutral-800 dark:bg-neutral-200",
    icon: <MiniToothIcon condition="amalgam" />,
  },
  {
    id: "composite",
    label: "Composite",
    tooltip: "Composite Filling (Tooth-colored resin)",
    selectedClass: "border-emerald-500/50 bg-emerald-500/10 ring-2 ring-emerald-500/30",
    badgeColor: "bg-emerald-500",
    icon: <MiniToothIcon condition="composite" />,
  },
  {
    id: "sealant",
    label: "Sealant",
    tooltip: "Dental Sealant (Preventive coating)",
    selectedClass: "border-pink-500/50 bg-pink-500/10 ring-2 ring-pink-500/30",
    badgeColor: "bg-pink-500",
    icon: <MiniToothIcon condition="sealant" />,
  },
  {
    id: "crown",
    label: "Crown",
    tooltip: "Dental Crown (Cap procedure)",
    selectedClass: "border-amber-500/50 bg-amber-500/10 ring-2 ring-amber-500/30",
    badgeColor: "bg-amber-500",
    icon: <MiniToothIcon condition="crown" />,
  },
  {
    id: "root-canal",
    label: "RCT",
    tooltip: "Root Canal Therapy (Endodontic treatment)",
    selectedClass: "border-purple-500/50 bg-purple-500/10 ring-2 ring-purple-500/30",
    badgeColor: "bg-purple-500",
    icon: <MiniToothIcon condition="root-canal" />,
  },
  {
    id: "radix",
    label: "Radix",
    tooltip: "Radix (Sisa Akar)",
    selectedClass: "border-rose-500/50 bg-rose-500/10 ring-2 ring-rose-500/30",
    badgeColor: "bg-rose-500",
    icon: <MiniToothIcon condition="radix" />,
  },
  {
    id: "unerupted",
    label: "Unerupted",
    tooltip: "Unerupted / Impaksi",
    selectedClass: "border-yellow-500/50 bg-yellow-500/10 ring-2 ring-yellow-500/30",
    badgeColor: "bg-yellow-500",
    icon: <MiniToothIcon condition="unerupted" />,
  },
  {
    id: "fracture",
    label: "Fracture",
    tooltip: "Fracture (Fraktur)",
    selectedClass: "border-orange-500/50 bg-orange-500/10 ring-2 ring-orange-500/30",
    badgeColor: "bg-orange-500",
    icon: <MiniToothIcon condition="fracture" />,
  },
  {
    id: "bridge",
    label: "Bridge",
    tooltip: "Dental Bridge (Prosthodontic restoration)",
    selectedClass: "border-blue-500/50 bg-blue-500/10 ring-2 ring-blue-500/30",
    badgeColor: "bg-blue-500",
    icon: <MiniToothIcon condition="bridge" />,
  },
  {
    id: "missing",
    label: "Missing",
    tooltip: "Missing Tooth (Absent/Extracted)",
    selectedClass: "border-red-500/50 bg-red-500/10 ring-2 ring-red-500/30",
    badgeColor: "bg-red-500",
    icon: <MiniToothIcon condition="missing" />,
  },
];

// Simplified SNOMED mapping for demo purposes
const SNOMED_MAPPING: Record<ToolType, { code: string; display: string }> = {
  select: { code: "", display: "" },
  eraser: { code: "", display: "" },
  caries: { code: "64228005", display: "Dental caries" },
  amalgam: { code: "37731006", display: "Amalgam filling" },
  composite: { code: "278142004", display: "Composite filling" },
  crown: { code: "105570003", display: "Dental crown" },
  missing: { code: "109675001", display: "Missing tooth" },
  "root-canal": { code: "394770001", display: "Root canal therapy" },
  sealant: { code: "61022005", display: "Dental sealant" },
  radix: { code: "370962002", display: "Retained tooth root" },
  unerupted: { code: "109677009", display: "Unerupted tooth" },
  fracture: { code: "312351000", display: "Fracture of tooth" },
  bridge: { code: "448275005", display: "Dental bridge construction" },
};

// Full FDI to SNOMED CT BodySite mapping for all 32 permanent and 20 deciduous teeth
const TOOTH_SNOMED: Record<number, { code: string; display: string }> = {
  // Permanent teeth
  11: { code: "22120004", display: "Structure of permanent maxillary right central incisor tooth" },
  12: { code: "11712009", display: "Structure of permanent maxillary right lateral incisor tooth" },
  13: { code: "80647007", display: "Structure of permanent maxillary right canine tooth" },
  14: { code: "57826002", display: "Structure of permanent maxillary right first premolar tooth" },
  15: { code: "36492000", display: "Structure of permanent maxillary right second premolar tooth" },
  16: { code: "5140004", display: "Structure of permanent maxillary right first molar tooth" },
  17: { code: "7121006", display: "Structure of permanent maxillary right second molar tooth" },
  18: { code: "68085002", display: "Structure of permanent maxillary right third molar tooth" },

  21: { code: "31982000", display: "Structure of permanent maxillary left central incisor tooth" },
  22: { code: "25748002", display: "Structure of permanent maxillary left lateral incisor tooth" },
  23: { code: "72876007", display: "Structure of permanent maxillary left canine tooth" },
  24: { code: "61897005", display: "Structure of permanent maxillary left first premolar tooth" },
  25: { code: "23226009", display: "Structure of permanent maxillary left second premolar tooth" },
  26: { code: "23427002", display: "Structure of permanent maxillary left first molar tooth" },
  27: { code: "66303006", display: "Structure of permanent maxillary left second molar tooth" },
  28: { code: "87704003", display: "Structure of permanent maxillary left third molar tooth" },

  31: { code: "245611006", display: "Structure of permanent mandibular left central incisor tooth" },
  32: { code: "245610007", display: "Structure of permanent mandibular left lateral incisor tooth" },
  33: { code: "245608005", display: "Structure of permanent mandibular left canine tooth" },
  34: { code: "245607000", display: "Structure of permanent mandibular left first premolar tooth" },
  35: { code: "245606009", display: "Structure of permanent mandibular left second premolar tooth" },
  36: { code: "245604007", display: "Structure of permanent mandibular left first molar tooth" },
  37: { code: "245603001", display: "Structure of permanent mandibular left second molar tooth" },
  38: { code: "245602006", display: "Structure of permanent mandibular left third molar tooth" },

  41: { code: "245600003", display: "Structure of permanent mandibular right central incisor tooth" },
  42: { code: "245599001", display: "Structure of permanent mandibular right lateral incisor tooth" },
  43: { code: "245597004", display: "Structure of permanent mandibular right canine tooth" },
  44: { code: "245596008", display: "Structure of permanent mandibular right first premolar tooth" },
  45: { code: "245595007", display: "Structure of permanent mandibular right second premolar tooth" },
  46: { code: "245592005", display: "Structure of permanent mandibular right first molar tooth" },
  47: { code: "245591003", display: "Structure of permanent mandibular right second molar tooth" },
  48: { code: "245589006", display: "Structure of permanent mandibular right third molar tooth" },

  // Deciduous teeth
  51: { code: "88824007", display: "Structure of deciduous maxillary right central incisor tooth" },
  52: { code: "65624003", display: "Structure of deciduous maxillary right lateral incisor tooth" },
  53: { code: "30618001", display: "Structure of deciduous maxillary right canine tooth" },
  54: { code: "17505006", display: "Structure of deciduous maxillary right first molar tooth" },
  55: { code: "27855007", display: "Structure of deciduous maxillary right second molar tooth" },

  61: { code: "51678005", display: "Structure of deciduous maxillary left central incisor tooth" },
  62: { code: "43622005", display: "Structure of deciduous maxillary left lateral incisor tooth" },
  63: { code: "73937000", display: "Structure of deciduous maxillary left canine tooth" },
  64: { code: "45234009", display: "Structure of deciduous maxillary left first molar tooth" },
  65: { code: "51943008", display: "Structure of deciduous maxillary left second molar tooth" },

  71: { code: "89552004", display: "Structure of deciduous mandibular left central incisor tooth" },
  72: { code: "14770005", display: "Structure of deciduous mandibular left lateral incisor tooth" },
  73: { code: "43281008", display: "Structure of deciduous mandibular left canine tooth" },
  74: { code: "38896004", display: "Structure of deciduous mandibular left first molar tooth" },
  75: { code: "49330006", display: "Structure of deciduous mandibular left second molar tooth" },

  81: { code: "67834006", display: "Structure of deciduous mandibular right central incisor tooth" },
  82: { code: "22445006", display: "Structure of deciduous mandibular right lateral incisor tooth" },
  83: { code: "6062009", display: "Structure of deciduous mandibular right canine tooth" },
  84: { code: "58646007", display: "Structure of deciduous mandibular right first molar tooth" },
  85: { code: "61868007", display: "Structure of deciduous mandibular right second molar tooth" },
};

export function FHIROdontogramInput({
  value = [],
  onChange,
  readOnly = false,
  className,
}: FHIROdontogramInputProps) {
  const [selectedTool, setSelectedTool] = useState<ToolType>("select");
  const [viewMode, setViewMode] = useState<"adult" | "child" | "mixed">("mixed");
  const [, forceUpdate] = useState({});

  // Derive teeth state from FHIR resources conforming to SATUSEHAT Observation format
  const teethState = useMemo(() => {
    const state: Record<number, Partial<Record<ToothSurface, ToothConditionType>>> = {};

    value.forEach(res => {
      if (res.resourceType !== "Observation") return;
      const isOdontogram = res.code?.coding?.some(
        (c: any) => c.system === "http://terminology.kemkes.go.id/CodeSystem/clinical-term" && c.code === "OC000061"
      );
      if (!isOdontogram) return;

      const toothSnomedCode = res.bodySite?.coding?.find((c: any) => c.system === "http://snomed.info/sct")?.code;
      if (!toothSnomedCode) return;

      const toothKey = Object.keys(TOOTH_SNOMED).find(
        k => TOOTH_SNOMED[parseInt(k, 10)].code === toothSnomedCode
      );
      if (!toothKey) return;
      const toothId = parseInt(toothKey, 10);

      if (!state[toothId]) state[toothId] = {};

      const condComp = res.component?.find(
        (comp: any) => comp.code?.coding?.some((c: any) => c.system === "http://terminology.kemkes.go.id/CodeSystem/odontogram-component" && c.code === "cond")
      );
      const condCode = condComp?.valueCodeableConcept?.coding?.[0]?.code;
      if (!condCode) return;

      const condition = Object.keys(SNOMED_MAPPING).find(
        k => SNOMED_MAPPING[k as ToolType].code === condCode
      ) as ToothConditionType;

      if (!condition) return;

      const surfComp = res.component?.find(
        (comp: any) => comp.code?.coding?.some((c: any) => c.system === "http://terminology.kemkes.go.id/CodeSystem/odontogram-component" && c.code === "surf")
      );
      const surfCode = surfComp?.valueCodeableConcept?.coding?.[0]?.code;

      const isWholeTooth =
        condition === "missing" ||
        condition === "crown" ||
        condition === "radix" ||
        condition === "unerupted" ||
        condition === "fracture" ||
        condition === "bridge";

      if (isWholeTooth || !surfCode) {
        // Apply to all surfaces
        ["O", "M", "D", "V", "L", "ROOT"].forEach(s => {
          if (state[toothId]) {
            state[toothId]![s as ToothSurface] = condition;
          }
        });
      } else {
        const activeSurface = (surfCode === "R" ? "ROOT" : surfCode) as ToothSurface;
        if (state[toothId]) {
          state[toothId]![activeSurface] = condition;
        }
      }
    });

    return state;
  }, [value]);

  const handleSurfaceClick = (toothId: number, surface: ToothSurface) => {
    if (readOnly || selectedTool === "select") return;

    if (selectedTool === "eraser") {
      if (onChange) {
        const newResources = value.filter(res => {
          if (res.resourceType !== "Observation") return true;

          const toothSnomedCode = res.bodySite?.coding?.find((c: any) => c.system === "http://snomed.info/sct")?.code;
          if (!toothSnomedCode) return true;

          const toothKey = Object.keys(TOOTH_SNOMED).find(
            k => TOOTH_SNOMED[parseInt(k, 10)].code === toothSnomedCode
          );
          if (!toothKey) return true;
          const toothIdFromResource = parseInt(toothKey, 10);

          const isSameTooth = toothIdFromResource === toothId;

          const surfComp = res.component?.find(
            (comp: any) => comp.code?.coding?.some((c: any) => c.system === "http://terminology.kemkes.go.id/CodeSystem/odontogram-component" && c.code === "surf")
          );
          const surfCode = surfComp?.valueCodeableConcept?.coding?.[0]?.code;
          const resourceSurface = surfCode === "R" ? "ROOT" : (surfCode || "O");

          const isSameSurface = resourceSurface === surface;

          const condComp = res.component?.find(
            (comp: any) => comp.code?.coding?.some((c: any) => c.system === "http://terminology.kemkes.go.id/CodeSystem/odontogram-component" && c.code === "cond")
          );
          const condCode = condComp?.valueCodeableConcept?.coding?.[0]?.code;
          const condition = Object.keys(SNOMED_MAPPING).find(
            k => SNOMED_MAPPING[k as ToolType].code === condCode
          );

          const isWholeTooth =
            condition === "missing" ||
            condition === "crown" ||
            condition === "radix" ||
            condition === "unerupted" ||
            condition === "fracture" ||
            condition === "bridge";

          if (isSameTooth) {
            if (isWholeTooth) return false;
            return !isSameSurface;
          }
          return true;
        });
        onChange(newResources);
      }
      return;
    }

    const mapping = SNOMED_MAPPING[selectedTool];
    if (!mapping.code) return;

    const toothSnomed = TOOTH_SNOMED[toothId];
    if (!toothSnomed) return;

    const isWholeTooth =
      selectedTool === "missing" ||
      selectedTool === "crown" ||
      selectedTool === "radix" ||
      selectedTool === "unerupted" ||
      selectedTool === "fracture" ||
      selectedTool === "bridge";

    const components: any[] = [];

    // Surface component (only if not whole tooth)
    if (!isWholeTooth) {
      components.push({
        code: {
          coding: [
            {
              system: "http://terminology.kemkes.go.id/CodeSystem/odontogram-component",
              code: "surf",
              display: "Permukaan gigi",
            },
          ],
        },
        valueCodeableConcept: {
          coding: [
            {
              system: "http://terminology.kemkes.go.id/CodeSystem/dental-surface",
              code: surface === "ROOT" ? "R" : surface,
              display: surface === "O" ? "Oklusal" :
                surface === "M" ? "Mesial" :
                  surface === "D" ? "Distal" :
                    surface === "V" ? "Vestibular" :
                      surface === "L" ? "Lingual" : "Akar",
            },
          ],
          text: surface === "O" ? "Oklusal" :
            surface === "M" ? "Mesial" :
              surface === "D" ? "Distal" :
                surface === "V" ? "Vestibular" :
                  surface === "L" ? "Lingual" : "Akar",
        },
      });
    }

    // Condition component
    components.push({
      code: {
        coding: [
          {
            system: "http://terminology.kemkes.go.id/CodeSystem/odontogram-component",
            code: "cond",
            display: "Keadaan Gigi",
          },
        ],
      },
      valueCodeableConcept: {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: mapping.code,
            display: mapping.display,
          },
        ],
        text: mapping.display,
      },
    });

    const newResource = {
      resourceType: "Observation",
      id: `generated-${Date.now()}`,
      status: "final",
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "exam",
              display: "Exam",
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: "http://terminology.kemkes.go.id/CodeSystem/clinical-term",
            code: "OC000061",
            display: "Pemeriksaan Odontogram",
          },
        ],
        text: "Pemeriksaan Odontogram",
      },
      subject: {
        reference: "Patient/example-patient"
      },
      bodySite: {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: toothSnomed.code,
            display: toothSnomed.display,
          },
        ],
        text: toothSnomed.display,
      },
      component: components,
    };

    if (onChange) {
      // Filter out any existing resource for this specific surface on this tooth
      const filteredValue = value.filter(res => {
        if (res.resourceType !== "Observation") return true;

        const toothSnomedCode = res.bodySite?.coding?.find((c: any) => c.system === "http://snomed.info/sct")?.code;
        if (!toothSnomedCode) return true;

        const toothKey = Object.keys(TOOTH_SNOMED).find(
          k => TOOTH_SNOMED[parseInt(k, 10)].code === toothSnomedCode
        );
        if (!toothKey) return true;
        const toothIdFromResource = parseInt(toothKey, 10);

        const isSameTooth = toothIdFromResource === toothId;

        const surfComp = res.component?.find(
          (comp: any) => comp.code?.coding?.some((c: any) => c.system === "http://terminology.kemkes.go.id/CodeSystem/odontogram-component" && c.code === "surf")
        );
        const surfCode = surfComp?.valueCodeableConcept?.coding?.[0]?.code;
        const resourceSurface = surfCode === "R" ? "ROOT" : (surfCode || "O");

        const isSameSurface = resourceSurface === surface;

        const condComp = res.component?.find(
          (comp: any) => comp.code?.coding?.some((c: any) => c.system === "http://terminology.kemkes.go.id/CodeSystem/odontogram-component" && c.code === "cond")
        );
        const condCode = condComp?.valueCodeableConcept?.coding?.[0]?.code;
        const condition = Object.keys(SNOMED_MAPPING).find(
          k => SNOMED_MAPPING[k as ToolType].code === condCode
        );

        const isWholeToothInResource =
          condition === "missing" ||
          condition === "crown" ||
          condition === "radix" ||
          condition === "unerupted" ||
          condition === "fracture" ||
          condition === "bridge";

        if (isSameTooth) {
          if (isWholeToothInResource) {
            return false;
          }
          return !isSameSurface;
        }
        return true;
      });

      // For whole tooth tools, we clear all other surface conditions for this tooth first
      const finalFilteredValue = isWholeTooth
        ? filteredValue.filter(res => {
          if (res.resourceType !== "Observation") return true;
          const toothSnomedCode = res.bodySite?.coding?.find((c: any) => c.system === "http://snomed.info/sct")?.code;
          if (!toothSnomedCode) return true;
          const toothKey = Object.keys(TOOTH_SNOMED).find(
            k => TOOTH_SNOMED[parseInt(k, 10)].code === toothSnomedCode
          );
          if (!toothKey) return true;
          const toothIdFromResource = parseInt(toothKey, 10);
          return toothIdFromResource !== toothId;
        })
        : filteredValue;

      onChange([...finalFilteredValue, newResource]);
    }
  };

  const renderArch = (indices: number[]) => {
    return indices.map((id, index) => {
      const toothState = teethState[id] || {};
      const hasBridge = Object.values(toothState).some((c) => c === "bridge");

      let hasBridgeLeft = false;
      let hasBridgeRight = false;

      if (hasBridge) {
        if (index > 0) {
          const leftId = indices[index - 1];
          if (leftId !== undefined) {
            const leftState = teethState[leftId] || {};
            hasBridgeLeft = Object.values(leftState).some((c) => c === "bridge");
          }
        }
        if (index < indices.length - 1) {
          const rightId = indices[index + 1];
          if (rightId !== undefined) {
            const rightState = teethState[rightId] || {};
            hasBridgeRight = Object.values(rightState).some((c) => c === "bridge");
          }
        }
      }

      return (
        <FHIROdontogramTooth
          key={id}
          id={id}
          surfaces={toothState}
          onSurfaceClick={handleSurfaceClick}
          interactive={!readOnly && selectedTool !== "select"}
          hasBridgeLeft={hasBridgeLeft}
          hasBridgeRight={hasBridgeRight}
        />
      );
    });
  };

  const q1 = [18, 17, 16, 15, 14, 13, 12, 11];
  const q2 = [21, 22, 23, 24, 25, 26, 27, 28];
  const q3 = [31, 32, 33, 34, 35, 36, 37, 38];
  const q4 = [48, 47, 46, 45, 44, 43, 42, 41];
  const q5 = [55, 54, 53, 52, 51];
  const q6 = [61, 62, 63, 64, 65];
  const q7 = [71, 72, 73, 74, 75];
  const q8 = [85, 84, 83, 82, 81];

  return (
    <TooltipProvider>
      <Card className={cn("flex flex-col bg-background overflow-hidden", className)}>
        {!readOnly && (
          <div className="p-2 border-b flex flex-wrap items-center gap-2 bg-muted/20">
            <ToggleGroup
              type="single"
              value={selectedTool}
              onValueChange={(val) => {
                if (val) {
                  setSelectedTool(val as ToolType);
                } else {
                  forceUpdate({});
                }
              }}
              variant="outline"
              spacing={2}
              size="lg"
              className="flex-wrap justify-start"
            >
              {TOOLS.map((tool, index) => {
                const isSelected = selectedTool === tool.id;
                return (
                  <React.Fragment key={tool.id}>
                    {index === 2 && (
                      <div className="w-px h-12 bg-border mx-1 self-center hidden sm:block shrink-0" />
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ToggleGroupItem
                          value={tool.id}
                          aria-label={tool.label}
                          className={cn(
                            "flex size-16 flex-col items-center justify-center relative transition-all duration-200",
                            isSelected ? tool.selectedClass : "hover:bg-muted"
                          )}
                        >
                          {tool.icon}
                          <span className="text-xs text-muted-foreground">{tool.label}</span>
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", tool.badgeColor)}></span>
                              <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", tool.badgeColor)}></span>
                            </span>
                          )}
                        </ToggleGroupItem>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{tool.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </React.Fragment>
                );
              })}
            </ToggleGroup>

            <div className="ml-auto flex gap-1">
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(val) => {
                  if (val) {
                    setViewMode(val as "adult" | "child" | "mixed");
                  } else {
                    forceUpdate({});
                  }
                }}
                variant="outline"
                size="default"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value="mixed"
                      className="h-9 px-3 text-xs font-semibold"
                    >
                      Adult + Child
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mixed dentition (All 52 teeth)</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value="adult"
                      className="h-9 px-3 text-xs font-semibold"
                    >
                      Adult
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Permanent dentition (32 teeth)</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value="child"
                      className="h-9 px-3 text-xs font-semibold"
                    >
                      Child
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Deciduous dentition (20 teeth)</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroup>
            </div>
          </div>
        )}

        <div className="p-2 md:p-4 overflow-x-auto">
          <div className="min-w-175 flex flex-col items-center gap-2 relative">

            <div className="absolute top-1/2 left-0 right-0 h-px bg-border -z-10" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border -translate-x-1/2 -z-10" />

            {/* Upper Adult Arch */}
            {(viewMode === "adult" || viewMode === "mixed") && (
              <div className="flex justify-center gap-3 md:gap-6 pt-4">
                <div className="flex gap-1 justify-end min-w-75">
                  {renderArch(q1)}
                </div>
                <div className="flex gap-1 justify-start min-w-75">
                  {renderArch(q2)}
                </div>
              </div>
            )}

            {/* Upper Child Arch */}
            {(viewMode === "child" || viewMode === "mixed") && (
              <div className="flex justify-center gap-3 md:gap-6 pt-1">
                <div className="flex gap-1 justify-end min-w-75">
                  {renderArch(q5)}
                </div>
                <div className="flex gap-1 justify-start min-w-75">
                  {renderArch(q6)}
                </div>
              </div>
            )}

            {/* Middle Gap for clarity */}
            {viewMode === "mixed" && <div className="h-4" />}

            {/* Lower Child Arch */}
            {(viewMode === "child" || viewMode === "mixed") && (
              <div className="flex justify-center gap-3 md:gap-6 pb-1">
                <div className="flex gap-1 justify-end min-w-75">
                  {renderArch(q8)}
                </div>
                <div className="flex gap-1 justify-start min-w-75">
                  {renderArch(q7)}
                </div>
              </div>
            )}

            {/* Lower Adult Arch */}
            {(viewMode === "adult" || viewMode === "mixed") && (
              <div className="flex justify-center gap-3 md:gap-6 pb-4">
                <div className="flex gap-1 justify-end min-w-75">
                  {renderArch(q4)}
                </div>
                <div className="flex gap-1 justify-start min-w-75">
                  {renderArch(q3)}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
}
