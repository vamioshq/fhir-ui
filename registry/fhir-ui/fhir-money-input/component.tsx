"use client";

import * as React from "react";
import { type Money } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface FHIRMoneyInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: Money;
  onChange?: (value: Money) => void;
  label?: string;
  description?: string;
  currencies?: Array<NonNullable<Money["currency"]>>;
  readOnly?: boolean;
}

const DEFAULT_CURRENCIES: Array<NonNullable<Money["currency"]>> = ["IDR", "USD", "EUR", "SGD", "AUD", "JPY", "GBP", "MYR"];

export function FHIRMoneyInput({
  value,
  onChange,
  label = "Amount (Money)",
  description,
  currencies = DEFAULT_CURRENCIES,
  readOnly = false,
  className,
  ...props
}: FHIRMoneyInputProps) {
  const [currency, setCurrency] = React.useState<NonNullable<Money["currency"]>>(
    (value?.currency || "IDR") as NonNullable<Money["currency"]>
  );
  const [amountValue, setAmountValue] = React.useState<number | undefined>(value?.value);
  const [displayValue, setDisplayValue] = React.useState<string>(
    value?.value !== undefined ? String(value.value) : ""
  );

  // Sync state if value prop changes
  React.useEffect(() => {
    setCurrency((value?.currency || "IDR") as NonNullable<Money["currency"]>);
    setAmountValue(value?.value);

    if (value?.value !== undefined) {
      const currentParsed = parseFloat(displayValue.replace(/,/g, ""));
      if (currentParsed !== value.value) {
        setDisplayValue(String(value.value));
      }
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const updateMoney = (
    newVal: number | undefined,
    newCurrency: NonNullable<Money["currency"]>
  ) => {
    if (!onChange) return;

    const updated: Money = {
      value: newVal,
      currency: newCurrency,
    };

    onChange(updated);
  };

  const handleCurrencyChange = (val: NonNullable<Money["currency"]>) => {
    setCurrency(val);
    updateMoney(amountValue, val);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Translate Indonesian comma decimals to standard dots on-the-fly
    let rawVal = e.target.value.replace(/,/g, ".");

    // Filter out any characters that aren't digits, dot, or minus sign
    rawVal = rawVal.replace(/[^0-9.-]/g, "");

    // Ensure only one minus sign at the start
    if (rawVal.startsWith("-")) {
      rawVal = "-" + rawVal.substring(1).replace(/-/g, "");
    } else {
      rawVal = rawVal.replace(/-/g, "");
    }

    // Ensure only one decimal point
    const parts = rawVal.split(".");
    if (parts.length > 2) {
      rawVal = parts[0] + "." + parts.slice(1).join("");
    }

    setDisplayValue(rawVal);

    // Parse value to numeric float
    const nextVal = rawVal && rawVal !== "-" ? parseFloat(rawVal) : undefined;
    setAmountValue(nextVal);
    updateMoney(nextVal, currency);
  };

  return (
    <div className={cn(className)} {...props}>
      <Field>
        <FieldLabel>{label}</FieldLabel>
        <InputGroup className="relative flex w-full items-center overflow-hidden h-8">
          {/* Currency Select Dropdown Addon on the left */}
          <InputGroupAddon>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <InputGroupButton
                  variant="ghost"
                  aria-label="Select currency"
                  className="font-mono text-xs px-2.5 h-6 flex items-center justify-center disabled:opacity-85"
                  disabled={readOnly}
                >
                  {currency}
                </InputGroupButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-48 overflow-y-auto">
                <DropdownMenuGroup>
                  {currencies.map((curr) => (
                    <DropdownMenuItem
                      key={curr}
                      onSelect={() => handleCurrencyChange(curr)}
                      className="font-mono text-xs"
                    >
                      {curr}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </InputGroupAddon>

          {/* Numeric Money Value Input */}
          <InputGroupInput
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            value={displayValue}
            onChange={handleValueChange}
            readOnly={readOnly}
            disabled={readOnly}
            className="min-w-0 h-full border-0 focus-visible:ring-0 text-right pr-3 disabled:opacity-85 font-mono text-sm"
          />
        </InputGroup>

        {description && <FieldDescription>{description}</FieldDescription>}
      </Field>
    </div>
  );
}
