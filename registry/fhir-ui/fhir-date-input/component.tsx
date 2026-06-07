"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  // Parse YYYY-MM-DD string to local Date object securely without timezone shifting issues
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      // Create date locally at midnight (match groups are guaranteed by regex)
      const year = parseInt(match[1]!, 10);
      const month = parseInt(match[2]!, 10);
      const day = parseInt(match[3]!, 10);
      const d = new Date(year, month - 1, day);
      return isNaN(d.getTime()) ? undefined : d;
    }
    // Fallback if not perfectly matching format
    const d = new Date(`${value}T00:00:00`);
    return isNaN(d.getTime()) ? undefined : d;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (readOnly) return;

    if (!date) {
      onChange?.("");
      return;
    }

    // Format reliably using date-fns or manual string assembly to avoid local timezone offset shifts
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    onChange?.(`${year}-${month}-${day}`);
  };

  return (
    <div className={cn("w-full flex flex-col gap-2", className)} {...props}>
      {showLabel && <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>}

      <Popover>
        <PopoverTrigger asChild>
          <Button
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
