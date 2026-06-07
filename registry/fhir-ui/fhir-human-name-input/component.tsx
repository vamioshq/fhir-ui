"use client";

import * as React from "react";
import { type HumanName } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FieldLabel, FieldDescription, FieldSet, FieldLegend } from "@/components/ui/field";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SlidersHorizontal, Trash2 } from "lucide-react";

export interface FHIRHumanNameInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: HumanName;
  onChange?: (value: HumanName) => void;
  label?: string;
  variant?: "simple" | "detailed";
  description?: string;
}

// Indonesian + Western name parser
// Handles: Indonesian titles (H., Hj., KH., Drs., Ir.), academic degrees (S.Kom., M.Kom.),
// medical specialties (Sp.PD, Sp.A), comma-separated suffixes, and single-word names
function parseSimpleName(fullName: string): HumanName {
  const name = fullName.trim();
  if (!name) return { use: "official" };

  // Split by comma first to handle suffixes (e.g., "Name, S.Kom., M.Kom.")
  const [mainPart, ...suffixParts] = name.split(',').map(s => s.trim());

  // Extract suffixes from comma-separated parts
  const suffixList = parseSuffixes(suffixParts);

  // Parse main part for prefixes, given names, and family name
  // Use fallback to full name if mainPart is undefined (no comma in name)
  const actualMainPart = mainPart || name;
  const words = actualMainPart.split(/\s+/).filter(Boolean);
  if (words.length === 0) return { use: "official", text: name };

  // Parse prefixes from the beginning
  const { prefixes: prefixList, remaining: nameWords } = extractPrefixes(words);

  // Parse given names and family name from remaining words
  const { given, family } = parseGivenAndFamily(nameWords);

  return {
    use: "official",
    family: family || undefined,
    given: given.length > 0 ? given : undefined,
    prefix: prefixList.length > 0 ? prefixList : undefined,
    suffix: suffixList.length > 0 ? suffixList : undefined,
    text: name,
  };
}

// Indonesian and Western prefixes (titles that appear at the start)
const INDONESIAN_PREFIXES = [
  "dr", "dr.", "drs", "drs.", "ir", "ir.", "prof", "prof.",
  "drr", "drr.", "drg", "drg.",
  "h", "h.", "hj", "hj.", "kh", "kh.", "ny", "ny.",
  "s", "s.", "r", "r.", "rd", "rd.",
  "mr", "mr.", "mrs", "mrs.", "ms", "ms.", "sir", "sister"
];

// Suffix patterns for Indonesian degrees and Western titles
const SUFFIX_PATTERNS = [
  // Indonesian Sarjana (Bachelor) degrees - S.xxx.
  /^s\.kom\.$/i, /^s\.ked\.$/i, /^s\.h\.$/i, /^s\.e\.$/i, /^s\.e\.i\.$/i,
  /^s\.p d\.$/i, /^s\.pd\.$/i, /^s\.t\.$/i, /^s\.ip\.$/i, /^s\.pt\.$/i,
  /^s\.farm\.$/i, /^s\.psi\.$/i, /^s\.ak\.$/i, /^s\.kg\.$/i,
  /^s\.biotech\.$/i, /^s\.sos\.$/i, /^s\.hum\.$/i, /^s\.sn\.$/i,
  /^s\.adm\.$/i, /^s\.ap\.$/i, /^s\.cs\.$/i, /^s\.info\.$/i,
  // Indonesian Magister (Master) degrees - M.xxx.
  /^m\.kom\.$/i, /^m\.ked\.$/i, /^m\.h\.$/i, /^m\.e\.$/i, /^m\.e\.i\.$/i,
  /^m\.m\.$/i, /^m\.p d\.$/i, /^m\.pd\.$/i, /^m\.t\.$/i, /^m\.ip\.$/i,
  /^m\.psi\.$/i, /^m\.farm\.$/i, /^m\.ak\.$/i, /^m\.kg\.$/i,
  /^m\.si\.$/i, /^m\.ba\.$/i, /^m\.sn\.$/i, /^m\.hum\.$/i, /^m\.sos\.$/i,
  /^m\.adm\.$/i, /^m\.cs\.$/i, /^m\.info\.$/i,
  // Medical specialties - Sp.xxx
  /^sp\.pd$/i, /^sp\.a$/i, /^sp\.og$/i, /^sp\.u$/i, /^sp\.b$/i,
  /^sp\.jp$/i, /^sp\.kk$/i, /^sp\.m$/i, /^sp\.pk$/i, /^sp\.tht$/i,
  /^sp\.kl$/i, /^sp\.an$/i, /^sp\.bp$/i, /^sp\.j$/i, /^sp\.ot$/i,
  /^sp\.p$/i, /^sp\.rad$/i, /^sp\.bf$/i, /^sp\.melin$/i, /^sp\.ok$/i,
  /^sp\.pa$/i, /^sp\.pj$/i, /^sp\.s$/i,
  // Generic Sp. pattern (for other specialties)
  /^sp\.$/i,
  // Western suffixes
  /^jr\.?$/i, /^sr\.?$/i, /^md$/i, /^phd$/i, /^m\.d\.$/i, /^ph\.d\.$/i,
  /^ii$/i, /^iii$/i, /^iv$/i, /^v$/i,
];

function extractPrefixes(words: string[]): { prefixes: string[]; remaining: string[] } {
  const prefixList: string[] = [];
  let wordIndex = 0;

  while (wordIndex < words.length) {
    const word = words[wordIndex];
    if (!word) break; // Skip undefined entries

    const lowerWord = word.toLowerCase();

    if (INDONESIAN_PREFIXES.includes(lowerWord)) {
      // Preserve original casing
      prefixList.push(word);
      wordIndex++;
    } else {
      break;
    }
  }

  return {
    prefixes: prefixList,
    remaining: words.slice(wordIndex)
  };
}

function parseSuffixes(suffixParts: string[]): string[] {
  const suffixList: string[] = [];

  for (const part of suffixParts) {
    if (!part) continue;

    // Split by space in case multiple suffixes are in one comma part
    const words = part.split(/\s+/).filter(Boolean);

    for (const word of words) {
      const lowerWord = word.toLowerCase();

      // Check if matches any known suffix pattern
      const isSuffix = SUFFIX_PATTERNS.some(pattern => pattern.test(lowerWord));

      if (isSuffix) {
        // Preserve original casing (common for degrees like M.Kom.)
        suffixList.push(word);
      } else {
        // Unknown word - try to match as degree pattern S.xxx or M.xxx
        if (/^[a-z]\.[a-z]+\.$/i.test(word)) {
          suffixList.push(word);
        }
      }
    }
  }

  return suffixList;
}

function parseGivenAndFamily(words: string[]): { given: string[]; family: string } {
  if (words.length === 0) {
    return { given: [], family: "" };
  }

  if (words.length === 1) {
    // Single word name - treat as given name, no family
    const firstWord = words[0];
    if (!firstWord) return { given: [], family: "" };
    return { given: [firstWord], family: "" };
  }

  // Multiple words: last word is family, rest are given names
  // This is a common pattern in Indonesian names
  const familyName = words[words.length - 1] || "";
  const givenNames = words.slice(0, -1);

  return { given: givenNames, family: familyName };
}

interface DetailedFieldsFormProps {
  use: HumanName["use"];
  family: string;
  given: string[];
  prefix: string[];
  suffix: string[];
  handleUseChange: (val: string) => void;
  handleFamilyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGivenChange: (index: number, val: string) => void;
  addGiven: () => void;
  removeGiven: (index: number) => void;
  handlePrefixChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSuffixChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function DetailedFieldsForm({
  use,
  family,
  given,
  prefix,
  suffix,
  handleUseChange,
  handleFamilyChange,
  handleGivenChange,
  addGiven,
  removeGiven,
  handlePrefixChange,
  handleSuffixChange,
}: DetailedFieldsFormProps) {
  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Use Type */}
          <Field>
            <FieldLabel htmlFor="name-use">Use Type</FieldLabel>
            <Select value={use} onValueChange={handleUseChange}>
              <SelectTrigger id="name-use" className="w-full">
                <SelectValue placeholder="Select use type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usual">Usual (Common name)</SelectItem>
                <SelectItem value="official">Official (Legal/Passport)</SelectItem>
                <SelectItem value="temp">Temporary</SelectItem>
                <SelectItem value="nickname">Nickname</SelectItem>
                <SelectItem value="anonymous">Anonymous</SelectItem>
                <SelectItem value="old">Old / Previous Name</SelectItem>
                <SelectItem value="maiden">Maiden Name</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Family Name */}
          <Field>
            <FieldLabel htmlFor="name-family">Family Name / Surname</FieldLabel>
            <Input
              id="name-family"
              placeholder="Surname"
              value={family}
              onChange={handleFamilyChange}
            />
          </Field>
        </div>

        {/* Given Names List */}
        <Field className="space-y-2">
          <div className="flex items-center justify-between">
            <FieldLabel className="mb-0">Given Name(s)</FieldLabel>
            <button
              type="button"
              onClick={addGiven}
              className="text-xs text-primary hover:underline font-semibold"
            >
              + Add Name
            </button>
          </div>

          <div className="space-y-1.5">
            {given.map((name, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  placeholder={
                    idx === 0
                      ? "First Name"
                      : idx === 1
                      ? "Middle Name"
                      : idx === 2
                      ? "Last Name"
                      : "Other"
                  }
                  value={name}
                  onChange={(e) => handleGivenChange(idx, e.target.value)}
                />
                {given.length > 1 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeGiven(idx)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        aria-label="Remove name"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Remove name</TooltipContent>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        </Field>

        {/* Prefix / Suffix Section */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Prefix */}
          <Field>
            <FieldLabel htmlFor="name-prefix">Prefix / Title</FieldLabel>
            <Input
              id="name-prefix"
              placeholder="e.g., Dr., Mr."
              value={prefix[0] || ""}
              onChange={handlePrefixChange}
            />
          </Field>

          {/* Suffix */}
          <Field>
            <FieldLabel htmlFor="name-suffix">Suffix / Credentials</FieldLabel>
            <Input
              id="name-suffix"
              placeholder="e.g., MD, PhD"
              value={suffix[0] || ""}
              onChange={handleSuffixChange}
            />
          </Field>
        </div>
      </div>
    </TooltipProvider>
  );
}

export function FHIRHumanNameInput({
  value,
  onChange,
  label = "Name Information",
  variant = "simple",
  className,
  description,
  ...props
}: FHIRHumanNameInputProps) {
  const [simpleInputVal, setSimpleInputVal] = React.useState(value?.text || "");

  // Local state for detailed fields
  const [use, setUse] = React.useState<HumanName["use"]>(value?.use || "official");
  const [family, setFamily] = React.useState(value?.family || "");
  const [given, setGiven] = React.useState<string[]>(value?.given || [""]);
  const [prefix, setPrefix] = React.useState<string[]>(value?.prefix || [""]);
  const [suffix, setSuffix] = React.useState<string[]>(value?.suffix || [""]);

  // Sync state if value prop changes
  React.useEffect(() => {
    if (value) {
      setUse(value.use || "official");
      setFamily(value.family || "");
      setGiven(value.given && value.given.length > 0 ? value.given : [""]);
      setPrefix(value.prefix && value.prefix.length > 0 ? value.prefix : [""]);
      setSuffix(value.suffix && value.suffix.length > 0 ? value.suffix : [""]);

      if (value.text) {
        setSimpleInputVal(value.text);
      } else {
        const textParts: string[] = [];
        if (value.prefix) textParts.push(...value.prefix);
        if (value.given) textParts.push(...value.given);
        if (value.family) textParts.push(value.family);
        if (value.suffix) textParts.push(...value.suffix);
        setSimpleInputVal(textParts.join(" "));
      }
    }
  }, [value]);

  const updateName = (
    newUse: HumanName["use"],
    newFamily: string,
    newGiven: string[],
    newPrefix: string[],
    newSuffix: string[]
  ) => {
    const cleanGiven = newGiven.filter(Boolean);
    const cleanPrefix = newPrefix.filter(Boolean);
    const cleanSuffix = newSuffix.filter(Boolean);

    const textParts: string[] = [];
    if (cleanPrefix.length > 0) textParts.push(cleanPrefix.join(" "));
    if (cleanGiven.length > 0) textParts.push(cleanGiven.join(" "));
    if (newFamily) textParts.push(newFamily);
    if (cleanSuffix.length > 0) textParts.push(cleanSuffix.join(" "));

    const updatedText = textParts.join(" ");
    setSimpleInputVal(updatedText);

    if (!onChange) return;

    const updated: HumanName = {
      use: newUse,
      family: newFamily || undefined,
      given: cleanGiven.length > 0 ? cleanGiven : undefined,
      prefix: cleanPrefix.length > 0 ? cleanPrefix : undefined,
      suffix: cleanSuffix.length > 0 ? cleanSuffix : undefined,
      text: updatedText || undefined,
    };

    onChange(updated);
  };

  const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSimpleInputVal(val);
    if (!onChange) return;

    const parsed = parseSimpleName(val);

    // Sync local states
    setUse(parsed.use || "official");
    setFamily(parsed.family || "");
    setGiven(parsed.given && parsed.given.length > 0 ? parsed.given : [""]);
    setPrefix(parsed.prefix && parsed.prefix.length > 0 ? parsed.prefix : [""]);
    setSuffix(parsed.suffix && parsed.suffix.length > 0 ? parsed.suffix : [""]);

    onChange(parsed);
  };

  const handleUseChange = (val: string) => {
    const nextUse = val as HumanName["use"];
    setUse(nextUse);
    updateName(nextUse, family, given, prefix, suffix);
  };

  const handleFamilyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFamily(val);
    updateName(use, val, given, prefix, suffix);
  };

  const handleGivenChange = (index: number, val: string) => {
    const updated = [...given];
    updated[index] = val;
    setGiven(updated);
    updateName(use, family, updated, prefix, suffix);
  };

  const addGiven = () => {
    const updated = [...given, ""];
    setGiven(updated);
  };

  const removeGiven = (index: number) => {
    const updated = given.filter((_, i) => i !== index);
    const final = updated.length > 0 ? updated : [""];
    setGiven(final);
    updateName(use, family, final, prefix, suffix);
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const updated = [val];
    setPrefix(updated);
    updateName(use, family, given, updated, suffix);
  };

  const handleSuffixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const updated = [val];
    setSuffix(updated);
    updateName(use, family, given, prefix, updated);
  };

  return (
    <TooltipProvider>
      <div className={cn(className)} {...props}>
        {variant === "detailed" ? (
          <FieldSet>
            <FieldLegend className="font-semibold text-sm leading-tight border-b pb-2 w-full">
              {label}
            </FieldLegend>
            <DetailedFieldsForm
              use={use}
              family={family}
              given={given}
              prefix={prefix}
              suffix={suffix}
              handleUseChange={handleUseChange}
              handleFamilyChange={handleFamilyChange}
              handleGivenChange={handleGivenChange}
              addGiven={addGiven}
              removeGiven={removeGiven}
              handlePrefixChange={handlePrefixChange}
              handleSuffixChange={handleSuffixChange}
            />
          </FieldSet>
        ) : (
          <Field>
            <FieldLabel htmlFor="simple-name-input">{label}</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="simple-name-input"
                placeholder="e.g., Dr. John Doe Jr."
                value={simpleInputVal}
                onChange={handleSimpleChange}
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
                    <TooltipContent side="top">Edit detailed fields</TooltipContent>
                  </Tooltip>

                  <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Name Details</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                      <DetailedFieldsForm
                        use={use}
                        family={family}
                        given={given}
                        prefix={prefix}
                        suffix={suffix}
                        handleUseChange={handleUseChange}
                        handleFamilyChange={handleFamilyChange}
                        handleGivenChange={handleGivenChange}
                        addGiven={addGiven}
                        removeGiven={removeGiven}
                        handlePrefixChange={handlePrefixChange}
                        handleSuffixChange={handleSuffixChange}
                      />
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
