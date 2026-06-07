"use client";

import * as React from "react";
import { CalendarIcon, Clock, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface FHIRDateTimeInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "value"> {
  value?: string; // FHIR ISO-8601 date-time string (e.g. "2026-06-05T02:35:00+07:00")
  onChange?: (value: string) => void;
  showLabel?: boolean;
  label?: string;
  readOnly?: boolean;
  defaultOffset?: string; // e.g. "+07:00" for WIB
}

// Regex to capture Date, Time, and Offset components
const parseFHIRDateTime = (valStr?: string, defaultOffset: string = "+07:00") => {
  if (!valStr) {
    return { date: "", time: "", offset: defaultOffset };
  }

  // Check for ISO date-time structure (e.g., 2026-06-05T02:35:00+07:00 or 2026-06-05T02:35:00Z)
  const match = valStr.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?(Z|[+-]\d{2}:\d{2})?$/);
  if (match) {
    return {
      date: match[1],
      time: match[2],
      offset: match[3] === "Z" ? "Z" : (match[3] || defaultOffset),
    };
  }

  // Check for plain date structure (e.g., 2026-06-05)
  const dateMatch = valStr.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (dateMatch) {
    return {
      date: dateMatch[1],
      time: "",
      offset: defaultOffset,
    };
  }

  // Fallback parser using Date constructor
  try {
    const d = new Date(valStr);
    if (!isNaN(d.getTime())) {
      const dateParts = d.toISOString().split("T");
      const date = dateParts[0] || "";
      const timeParts = d.toTimeString().split(" ");
      const time = timeParts[0] ? timeParts[0].substring(0, 5) : "";
      
      // Calculate offset
      const timezoneOffset = -d.getTimezoneOffset();
      const sign = timezoneOffset >= 0 ? "+" : "-";
      const hours = String(Math.floor(Math.abs(timezoneOffset) / 60)).padStart(2, "0");
      const minutes = String(Math.abs(timezoneOffset) % 60).padStart(2, "0");
      const offset = `${sign}${hours}:${minutes}`;
      
      return { date, time, offset };
    }
  } catch (e) {
    // Ignore and fall back to empty
  }

  return { date: "", time: "", offset: defaultOffset };
};

const OFFSET_LABELS: Record<string, string> = {
  "+07:00": "WIB (+07)",
  "+08:00": "WITA (+08)",
  "+09:00": "WIT (+09)",
  "Z": "UTC (Z)",
};

const formatDateLocal = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplay = (valStr?: string) => {
  if (!valStr) return "Select Date & Time";
  try {
    const { date, time, offset } = parseFHIRDateTime(valStr);
    if (!date) return "Select Date & Time";

    // Reconstruct date object securely for locale string
    const d = new Date(`${date}T00:00:00`);
    const dateFormatted = d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    
    const offsetLabel = offset === "Z" ? "UTC" : offset === "+07:00" ? "WIB" : offset === "+08:00" ? "WITA" : offset === "+09:00" ? "WIT" : offset;
    
    if (time) {
      return `${dateFormatted}, ${time} (${offsetLabel})`;
    }
    return dateFormatted;
  } catch (e) {
    return valStr;
  }
};

export function FHIRDateTimeInput({
  value,
  onChange,
  showLabel = false,
  label = "Date & Time",
  readOnly = false,
  defaultOffset = "+07:00",
  className,
  ...props
}: FHIRDateTimeInputProps) {
  const state = React.useMemo(() => parseFHIRDateTime(value, defaultOffset), [value, defaultOffset]);

  const selectedDate = React.useMemo(() => {
    if (!state.date) return undefined;
    const d = new Date(`${state.date}T00:00:00`);
    return isNaN(d.getTime()) ? undefined : d;
  }, [state.date]);

  const handleStateChange = (updates: Partial<typeof state>) => {
    if (readOnly) return;

    const nextState = { ...state, ...updates };

    if (onChange) {
      if (!nextState.date) {
        onChange("");
        return;
      }

      if (nextState.time) {
        onChange(`${nextState.date}T${nextState.time}:00${nextState.offset}`);
      } else {
        onChange(nextState.date);
      }
    }
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
              !state.date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
            <span>{formatDisplay(value)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 flex flex-col gap-3" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(dateObj) => {
              if (dateObj) {
                handleStateChange({ date: formatDateLocal(dateObj) });
              } else {
                handleStateChange({ date: "" });
              }
            }}
            disabled={readOnly}
          />

          <div className="flex items-center gap-2 border-t border-border/60 pt-3">
            <div className="flex items-center gap-1.5 flex-1 min-w-[100px]">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Input
                type="time"
                value={state.time}
                onChange={(e) => handleStateChange({ time: e.target.value })}
                disabled={readOnly || !state.date}
                className="h-8 text-xs font-mono text-center flex-1 px-2 border-input"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
              <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Select
                value={state.offset}
                onValueChange={(val) => handleStateChange({ offset: val })}
                disabled={readOnly || !state.date || !state.time}
              >
                <SelectTrigger className="h-8 text-xs font-mono flex-1 border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {Object.entries(OFFSET_LABELS).map(([offsetVal, labelStr]) => (
                    <SelectItem key={offsetVal} value={offsetVal} className="text-xs font-mono">
                      {labelStr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
