"use client";

import * as React from "react";
import { type Period } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FHIRDateTimeInput } from "@/registry/fhir-ui/fhir-datetime-input";

export interface FHIRPeriodInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "value"> {
  value?: Period;
  onChange?: (value: Period) => void;
  showLabel?: boolean;
  label?: string;
  readOnly?: boolean;
  defaultOffset?: string;
}

export function FHIRPeriodInput({
  value,
  onChange,
  showLabel = false,
  label = "Period Bounds",
  readOnly = false,
  defaultOffset = "+07:00",
  className,
  ...props
}: FHIRPeriodInputProps) {
  // Validate that end datetime is after or equal to start datetime
  const isValid = React.useMemo(() => {
    if (!value?.start || !value?.end) return true;
    try {
      const startTime = new Date(value.start).getTime();
      const endTime = new Date(value.end).getTime();
      return isNaN(startTime) || isNaN(endTime) || endTime >= startTime;
    } catch (e) {
      return true;
    }
  }, [value?.start, value?.end]);

  const handleStartChange = (startVal: string) => {
    if (readOnly || !onChange) return;
    onChange({
      ...value,
      start: startVal || undefined,
    });
  };

  const handleEndChange = (endVal: string) => {
    if (readOnly || !onChange) return;
    onChange({
      ...value,
      end: endVal || undefined,
    });
  };

  return (
    <div className={cn("w-full flex flex-col gap-2", className)} {...props}>
      <div className="flex items-center justify-between gap-2 w-full">
        {showLabel && <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>}
        {!isValid && (
          <Badge
            variant="outline"
            className="text-[10px] font-semibold text-destructive bg-destructive/10 border-destructive/20 uppercase tracking-wider rounded-full px-2 py-0.5"
          >
            End is before Start
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Start DateTime Input */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider pl-0.5">
            Start Bounds
          </span>
          <FHIRDateTimeInput
            value={value?.start || ""}
            onChange={handleStartChange}
            readOnly={readOnly}
            defaultOffset={defaultOffset}
          />
        </div>

        {/* End DateTime Input */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-muted-foreground/80 uppercase tracking-wider pl-0.5">
            End Bounds (Optional)
          </span>
          <FHIRDateTimeInput
            value={value?.end || ""}
            onChange={handleEndChange}
            readOnly={readOnly}
            defaultOffset={defaultOffset}
          />
        </div>
      </div>
    </div>
  );
}
