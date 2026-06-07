"use client";

import React, { useState } from "react";
import { FHIRDateTimeInput } from "@/registry/fhir-ui/fhir-datetime-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FHIRDateTimeInputDemo() {
  const [value, setValue] = useState<string>("2026-06-05T02:35:00+07:00");
  const [readOnly, setReadOnly] = useState(false);
  const [showLabel, setShowLabel] = useState(true);
  const [defaultOffset, setDefaultOffset] = useState("+07:00");

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      {/* Config Row */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 p-4 bg-muted/30 rounded-xl border border-border/80">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Default Offset
          </label>
          <Select value={defaultOffset} onValueChange={setDefaultOffset}>
            <SelectTrigger className="h-8 text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="+07:00">+07:00 (WIB)</SelectItem>
              <SelectItem value="+08:00">+08:00 (WITA)</SelectItem>
              <SelectItem value="+09:00">+09:00 (WIT)</SelectItem>
              <SelectItem value="Z">Z (UTC)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4 sm:pr-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="dt-demo-label-checkbox"
              checked={showLabel}
              onCheckedChange={(checked) => setShowLabel(!!checked)}
            />
            <label
              htmlFor="dt-demo-label-checkbox"
              className="text-xs font-medium leading-none select-none cursor-pointer whitespace-nowrap"
            >
              Show Input Label
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="dt-demo-readonly-checkbox"
              checked={readOnly}
              onCheckedChange={(checked) => setReadOnly(!!checked)}
            />
            <label
              htmlFor="dt-demo-readonly-checkbox"
              className="text-xs font-medium leading-none select-none cursor-pointer whitespace-nowrap"
            >
              Read Only Mode
            </label>
          </div>
        </div>
      </div>

      {/* Render Component */}
      <div className="p-6 bg-background border border-border rounded-xl flex items-center justify-center min-h-[120px]">
        <FHIRDateTimeInput
          value={value}
          onChange={setValue}
          showLabel={showLabel}
          readOnly={readOnly}
          defaultOffset={defaultOffset}
          className="max-w-md"
        />
      </div>

      {/* Output Payloads */}
      <div className="w-full p-4 bg-muted/40 rounded-lg overflow-auto max-h-[300px] border border-border">
        <div className="font-semibold text-muted-foreground mb-2 flex items-center justify-between text-xs">
          <span>onChange Output (FHIR dateTime String)</span>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans">
            FHIR dateTime (ISO-8601)
          </span>
        </div>
        <pre className="text-xs text-foreground whitespace-pre-wrap font-mono max-h-[220px] scrollbar-thin overflow-y-auto">
          {value ? JSON.stringify({ value }, null, 2) : "Empty value."}
        </pre>
      </div>
    </div>
  );
}
