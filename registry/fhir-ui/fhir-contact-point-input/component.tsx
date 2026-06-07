"use client";

import * as React from "react";
import { type ContactPoint } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel, FieldDescription, FieldSet, FieldLegend } from "@/components/ui/field";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

function getInputType(system: ContactPoint["system"]): string {
  switch (system) {
    case "phone":
    case "sms":
      return "tel";
    case "email":
      return "email";
    case "url":
      return "url";
    default:
      return "text";
  }
}

export interface FHIRContactPointInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: ContactPoint;
  onChange?: (value: ContactPoint) => void;
  label?: string;
  variant?: "simple" | "detailed";
  system?: ContactPoint["system"];
  use?: ContactPoint["use"];
  description?: string;
}

export function FHIRContactPointInput({
  value,
  onChange,
  label = "Contact Information",
  variant = "simple",
  className,
  system: propSystem,
  use: propUse,
  description,
  ...props
}: FHIRContactPointInputProps) {
  // Determine active system configuration (Defaults to "phone" if prop and value are missing)
  const activeSystem = propSystem || value?.system || "phone";

  // State setup
  const [use, setUse] = React.useState<ContactPoint["use"]>(
    value?.use || (activeSystem === "phone" || activeSystem === "sms" ? "mobile" : "home")
  );
  const [contactValue, setContactValue] = React.useState(value?.value || "");
  const [rank, setRank] = React.useState<number | undefined>(value?.rank);
  const [periodStart, setPeriodStart] = React.useState(value?.period?.start || "");
  const [periodEnd, setPeriodEnd] = React.useState(value?.period?.end || "");

  // Sync state if value prop changes
  React.useEffect(() => {
    if (value) {
      setUse(
        value.use || (activeSystem === "phone" || activeSystem === "sms" ? "mobile" : "home")
      );
      setContactValue(value.value || "");
      setRank(value.rank);
      setPeriodStart(value.period?.start || "");
      setPeriodEnd(value.period?.end || "");
    }
  }, [value, activeSystem]);

  const updateContactPoint = (
    newUse: ContactPoint["use"],
    newVal: string,
    newRank: number | undefined,
    newStart: string,
    newEnd: string
  ) => {
    setContactValue(newVal);

    if (!onChange) return;

    const updated: ContactPoint = {
      system: activeSystem,
      use: newUse,
      value: newVal || undefined,
      rank: newRank,
      period: (newStart || newEnd) ? {
        start: newStart || undefined,
        end: newEnd || undefined,
      } : undefined,
    };

    onChange(updated);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setContactValue(val);
    updateContactPoint(use, val, rank, periodStart, periodEnd);
  };

  const handleUseChange = (val: string) => {
    const nextUse = val as ContactPoint["use"];
    setUse(nextUse);
    updateContactPoint(nextUse, contactValue, rank, periodStart, periodEnd);
  };

  const handleRankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
    setRank(val);
    updateContactPoint(use, contactValue, val, periodStart, periodEnd);
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPeriodStart(val);
    updateContactPoint(use, contactValue, rank, val, periodEnd);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPeriodEnd(val);
    updateContactPoint(use, contactValue, rank, periodStart, val);
  };

  const getValuePlaceholder = () => {
    switch (activeSystem) {
      case "phone":
      case "sms":
      case "fax":
        return "+62 812-3456-7890";
      case "email":
        return "name@domain.com";
      case "url":
        return "https://hospital.org";
      default:
        return "Contact detail...";
    }
  };

  return (
    <TooltipProvider>
      <div className={cn(className)} {...props}>
        {variant === "detailed" ? (
          <FieldSet>
            <FieldLegend className="font-semibold text-sm leading-tight border-b pb-2 w-full">
              {label}
            </FieldLegend>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Contact Value */}
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="detailed-contact-value">Value</FieldLabel>
                <Input
                  id="detailed-contact-value"
                  type={getInputType(activeSystem)}
                  placeholder={getValuePlaceholder()}
                  value={contactValue}
                  onChange={handleValueChange}
                />
              </Field>

              {/* Usage Select */}
              <Field>
                <FieldLabel htmlFor="detailed-contact-use">Usage</FieldLabel>
                <Select value={use} onValueChange={handleUseChange}>
                  <SelectTrigger id="detailed-contact-use" className="w-full">
                    <SelectValue placeholder="Select usage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="temp">Temporary</SelectItem>
                    <SelectItem value="old">Old / Previous</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              {/* Priority Rank */}
              <Field>
                <FieldLabel htmlFor="detailed-contact-rank">Priority Rank</FieldLabel>
                <Input
                  id="detailed-contact-rank"
                  type="number"
                  min={1}
                  placeholder="e.g., 1 (Highest)"
                  value={rank === undefined ? "" : rank}
                  onChange={handleRankChange}
                />
              </Field>

              {/* Period Start */}
              <Field>
                <FieldLabel htmlFor="detailed-contact-start">Active From</FieldLabel>
                <Input
                  id="detailed-contact-start"
                  type="date"
                  value={periodStart}
                  onChange={handleStartChange}
                />
              </Field>

              {/* Period End */}
              <Field>
                <FieldLabel htmlFor="detailed-contact-end">Active To</FieldLabel>
                <Input
                  id="detailed-contact-end"
                  type="date"
                  value={periodEnd}
                  onChange={handleEndChange}
                />
              </Field>
            </div>
          </FieldSet>
        ) : (
          <Field>
            <FieldLabel htmlFor="simple-contact-input">{label}</FieldLabel>

            <InputGroup>
              <InputGroupInput
                id="simple-contact-input"
                type={getInputType(activeSystem)}
                placeholder={getValuePlaceholder()}
                value={contactValue}
                onChange={handleValueChange}
              />
              <InputGroupAddon align="inline-end">
                <Dialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <InputGroupButton size="icon-xs" variant="ghost" aria-label="Edit detailed fields">
                          <SlidersHorizontal className="size-4" />
                        </InputGroupButton>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top">Edit details</TooltipContent>
                  </Tooltip>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Contact Details</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      {/* Value Input */}
                      <Field>
                        <FieldLabel htmlFor="dialog-contact-value">Contact Value</FieldLabel>
                        <Input
                          id="dialog-contact-value"
                          type={getInputType(activeSystem)}
                          placeholder={getValuePlaceholder()}
                          value={contactValue}
                          onChange={handleValueChange}
                        />
                      </Field>

                      <div className="grid gap-4 grid-cols-2">
                        {/* Usage Dropdown */}
                        <Field>
                          <FieldLabel htmlFor="dialog-contact-use">Usage Type</FieldLabel>
                          <Select value={use} onValueChange={handleUseChange}>
                            <SelectTrigger id="dialog-contact-use" className="w-full">
                              <SelectValue placeholder="Select usage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="home">Home</SelectItem>
                              <SelectItem value="work">Work</SelectItem>
                              <SelectItem value="mobile">Mobile</SelectItem>
                              <SelectItem value="temp">Temporary</SelectItem>
                              <SelectItem value="old">Old / Previous</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>

                        {/* Priority Rank */}
                        <Field>
                          <FieldLabel htmlFor="dialog-contact-rank">Priority Rank</FieldLabel>
                          <Input
                            id="dialog-contact-rank"
                            type="number"
                            min={1}
                            placeholder="e.g., 1"
                            value={rank === undefined ? "" : rank}
                            onChange={handleRankChange}
                          />
                        </Field>
                      </div>

                      <div className="grid gap-4 grid-cols-2">
                        {/* Period Start */}
                        <Field>
                          <FieldLabel htmlFor="dialog-contact-start">Active From</FieldLabel>
                          <Input
                            id="dialog-contact-start"
                            type="date"
                            value={periodStart}
                            onChange={handleStartChange}
                          />
                        </Field>

                        {/* Period End */}
                        <Field>
                          <FieldLabel htmlFor="dialog-contact-end">Active To</FieldLabel>
                          <Input
                            id="dialog-contact-end"
                            type="date"
                            value={periodEnd}
                            onChange={handleEndChange}
                          />
                        </Field>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </InputGroupAddon>
            </InputGroup>
            {description && <FieldDescription>{description}</FieldDescription>}
          </Field>
        )}
      </div>
    </TooltipProvider>
  );
}
