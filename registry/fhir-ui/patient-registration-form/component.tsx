"use client";

import * as React from "react";
import {
  type Patient,
  type HumanName,
  type Extension,
  type CodeableConcept,
  type Address,
} from "@medplum/fhirtypes";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FHIRHumanNameInput } from "@/registry/fhir-ui/fhir-human-name-input";
import { FHIRDateInput } from "@/registry/fhir-ui/fhir-date-input";
import { FHIRGenderInput } from "@/registry/fhir-ui/fhir-gender-input";
import { FHIRCitizenshipStatusInput } from "@/registry/fhir-ui/fhir-citizenship-status-input";
import { FHIRReligionInput } from "@/registry/fhir-ui/fhir-religion-input";
import { FHIRMaritalStatusInput } from "@/registry/fhir-ui/fhir-marital-status-input";
import { FHIRAddressInput } from "@/registry/fhir-ui/fhir-address-input";
import { Check, Copy, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PatientRegistrationFormProps extends React.HTMLAttributes<HTMLDivElement> {
  onSubmitSuccess?: (patient: Patient) => void;
  readOnly?: boolean;
}

export function PatientRegistrationForm({
  onSubmitSuccess,
  readOnly = false,
  className,
  ...props
}: PatientRegistrationFormProps) {
  // 1. Demographics States
  const [name, setName] = React.useState<HumanName | undefined>(undefined);
  const [birthDate, setBirthDate] = React.useState<string>("");
  const [gender, setGender] = React.useState<"male" | "female" | "other" | "unknown" | undefined>(
    undefined
  );
  const [citizenship, setCitizenship] = React.useState<Extension | undefined>(undefined);
  const [religion, setReligion] = React.useState<Extension | undefined>(undefined);
  const [maritalStatus, setMaritalStatus] = React.useState<CodeableConcept | undefined>(undefined);
  const [address, setAddress] = React.useState<Address | undefined>(undefined);

  // 2. Output and Copy State
  const [generatedPayload, setGeneratedPayload] = React.useState<Patient | null>(null);
  const [copied, setCopied] = React.useState(false);

  // 3. Assemble FHIR Patient Resource
  const assemblePatient = React.useCallback((): Patient => {
    const extensions: Extension[] = [];
    if (citizenship) extensions.push(citizenship);
    if (religion) extensions.push(religion);

    return {
      resourceType: "Patient",
      active: true,
      name: name ? [name] : undefined,
      gender: gender,
      birthDate: birthDate || undefined,
      maritalStatus: maritalStatus,
      address: address ? [address] : undefined,
      extension: extensions.length > 0 ? extensions : undefined,
    };
  }, [name, birthDate, gender, citizenship, religion, maritalStatus, address]);

  // Handle local submit/generation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = assemblePatient();
    setGeneratedPayload(payload);
    if (onSubmitSuccess) {
      onSubmitSuccess(payload);
    }
  };

  const handleCopy = async () => {
    if (!generatedPayload) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(generatedPayload, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy payload:", err);
    }
  };

  return (
    <div className={cn("w-full max-w-4xl grid gap-8 md:grid-cols-5 items-start", className)} {...props}>
      {/* Form Card */}
      <Card className="md:col-span-3 shadow-md border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <UserPlus className="h-5 w-5 text-primary" />
            Patient Registration Form
          </CardTitle>
          <CardDescription>
            Collect demographic and administrative details conforming to Kemenkes SATUSEHAT standards.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-6">
            {/* Name Input */}
            <FHIRHumanNameInput
              value={name}
              onChange={setName}
            />

            {/* Birth Date & Gender */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FHIRDateInput
                value={birthDate}
                onChange={setBirthDate}
                showLabel
                label="Birth Date"
                readOnly={readOnly}
              />
              <FHIRGenderInput
                value={gender}
                onChange={setGender}
                showLabel
                label="Administrative Gender"
                variant="select"
                readOnly={readOnly}
              />
            </div>

            {/* Citizenship & Religion */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FHIRCitizenshipStatusInput
                value={citizenship}
                onChange={setCitizenship}
                showLabel
                label="Citizenship"
                variant="select"
                readOnly={readOnly}
              />
              <FHIRReligionInput
                value={religion}
                onChange={setReligion}
                showLabel
                label="Religion (SATUSEHAT)"
                variant="select"
                readOnly={readOnly}
              />
            </div>

            {/* Marital Status */}
            <FHIRMaritalStatusInput
              value={maritalStatus}
              onChange={setMaritalStatus}
              showLabel
              label="Marital Status"
              variant="toggle"
              readOnly={readOnly}
            />

            {/* Address Input */}
            <FHIRAddressInput
              value={address}
              onChange={setAddress}
              label="Home Address"
              variant="detailed"
            />
          </CardContent>

          <CardFooter className="border-t px-6 py-4 flex justify-between bg-muted/20">
            <span className="text-xs text-muted-foreground font-mono">FHIR R4 Schema compliant</span>
            <Button type="submit" disabled={readOnly} size="sm">
              Generate FHIR Patient
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* JSON Output Viewer Card */}
      <Card className="md:col-span-2 shadow-sm border-border bg-card h-full min-h-[500px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-sm font-bold">FHIR Patient Output</CardTitle>
            <CardDescription className="text-xs">Generated JSON Resource payload</CardDescription>
          </div>
          {generatedPayload && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 pt-0">
          <div className="flex-1 rounded-lg border bg-muted/40 p-4 font-mono text-xs overflow-auto max-h-[580px]">
            {generatedPayload ? (
              <pre className="text-muted-foreground whitespace-pre-wrap selection:bg-primary/20">
                {JSON.stringify(generatedPayload, null, 2)}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-2 py-12">
                <p>No payload generated yet.</p>
                <p className="text-[10px] max-w-[200px]">
                  Fill out the registration details and click &quot;Generate FHIR Patient&quot;.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
