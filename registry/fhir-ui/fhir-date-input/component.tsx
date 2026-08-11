"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatFHIRDate, parseFHIRDate } from "@/lib/fhir/date";

export interface FHIRDateInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "value"> {
  value?: string; // FHIR date string (e.g. "2026-06-05")
  onChange?: (value: string) => void;
  showLabel?: boolean;
  label?: string;
  readOnly?: boolean;
}

export function FHIRDateInput({
  value,
  onChange,
  showLabel = false,
  label = "Date",
  readOnly = false,
  className,
  ...props
}: FHIRDateInputProps) {
  const inputId = React.useId();
  // Parse YYYY-MM-DD string to local Date object securely without timezone shifting issues
  const selectedDate = React.useMemo(() => parseFHIRDate(value), [value]);

  const handleSelect = (date: Date | undefined) => {
    if (readOnly) return;

    if (!date) {
      onChange?.("");
      return;
    }

    // Format reliably using date-fns or manual string assembly to avoid local timezone offset shifts
    onChange?.(formatFHIRDate(date));
  };

  return (
    <div className={cn("w-full flex flex-col gap-2", className)} {...props}>
      {showLabel && <Label htmlFor={inputId} className="text-xs font-semibold text-muted-foreground">{label}</Label>}

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={inputId}
            aria-label={label}
            variant="outline"
            disabled={readOnly}
            className={cn(
              "w-full justify-start text-left font-mono text-xs h-8 px-3 border border-input rounded-lg transition-colors hover:bg-muted/50 hover:text-foreground",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={readOnly}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
