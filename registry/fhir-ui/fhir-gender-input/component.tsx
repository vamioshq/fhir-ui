"use client";

import * as React from "react";
import { Mars, Venus, CircleDot, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ButtonGroupSeparator } from "@/components/ui/button-group";

export interface FHIRGenderInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "value"> {
  value?: "male" | "female" | "other" | "unknown";
  onChange?: (value: "male" | "female" | "other" | "unknown") => void;
  variant?: "toggle" | "select";
  showLabel?: boolean;
  label?: string;
  readOnly?: boolean;
}

const GENDER_OPTIONS = [
  { value: "male" as const, label: "Male", icon: Mars },
  { value: "female" as const, label: "Female", icon: Venus },
  { value: "other" as const, label: "Other", icon: CircleDot },
  { value: "unknown" as const, label: "Unknown", icon: HelpCircle },
];

export function FHIRGenderInput({
  value,
  onChange,
  variant = "toggle",
  showLabel = false,
  label = "Administrative Gender",
  readOnly = false,
  className,
  ...props
}: FHIRGenderInputProps) {
  const handleValueChange = (val: string) => {
    if (readOnly || !onChange) return;
    if (val === "male" || val === "female" || val === "other" || val === "unknown") {
      onChange(val);
    }
  };

  return (
    <div className={cn("w-full flex flex-col gap-2", className)} {...props}>
      {showLabel && <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>}

      {variant === "toggle" ? (
        <ToggleGroup
          type="single"
          value={value || ""}
          onValueChange={handleValueChange}
          disabled={readOnly}
          className="flex flex-row items-center border border-input rounded-lg overflow-hidden w-fit gap-0 bg-transparent h-8"
        >
          {GENDER_OPTIONS.map((opt, idx) => {
            const Icon = opt.icon;
            return (
              <React.Fragment key={opt.value}>
                {idx > 0 && <ButtonGroupSeparator className="bg-input" />}
                <ToggleGroupItem
                  value={opt.value}
                  aria-label={`Select ${opt.label}`}
                  className="h-full rounded-none border-0 px-3 hover:bg-muted/50 hover:text-foreground font-medium text-xs gap-1.5 transition-all outline-none"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{opt.label}</span>
                </ToggleGroupItem>
              </React.Fragment>
            );
          })}
        </ToggleGroup>
      ) : (
        <Select
          value={value || "none"}
          onValueChange={(val) => handleValueChange(val === "none" ? "" : val)}
          disabled={readOnly}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Gender" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="none">Select Gender</SelectItem>
            {GENDER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <div className="flex items-center gap-2">
                  <opt.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{opt.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
