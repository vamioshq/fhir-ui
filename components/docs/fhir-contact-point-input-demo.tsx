"use client";

import * as React from "react";
import { FHIRContactPointInput } from "@/registry/fhir-ui/fhir-contact-point-input";
import { type ContactPoint } from "@medplum/fhirtypes";

interface FHIRContactPointInputDemoProps {
  variant?: "simple" | "detailed";
}

export function FHIRContactPointInputDemo({ variant = "simple" }: FHIRContactPointInputDemoProps = {}) {
  const [phone, setPhone] = React.useState<ContactPoint>({});
  const [email, setEmail] = React.useState<ContactPoint>({});
  const [url, setUrl] = React.useState<ContactPoint>({});
  const [sms, setSms] = React.useState<ContactPoint>({});
  const [fax, setFax] = React.useState<ContactPoint>({});
  const [pager, setPager] = React.useState<ContactPoint>({});
  const [other, setOther] = React.useState<ContactPoint>({});

  const combinedChannels = {
    phone: Object.keys(phone).length ? phone : undefined,
    email: Object.keys(email).length ? email : undefined,
    url: Object.keys(url).length ? url : undefined,
    sms: Object.keys(sms).length ? sms : undefined,
    fax: Object.keys(fax).length ? fax : undefined,
    pager: Object.keys(pager).length ? pager : undefined,
    other: Object.keys(other).length ? other : undefined,
  };

  // Clean up undefined properties for a cleaner preview output
  const activeChannels = Object.fromEntries(
    Object.entries(combinedChannels).filter(([_, v]) => v !== undefined)
  );

  return (
    <div className="w-full space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FHIRContactPointInput
          variant={variant}
          system="phone"
          label="Phone Number"
          description="Include country code, e.g., +62"
          onChange={setPhone}
        />
        <FHIRContactPointInput
          variant={variant}
          system="email"
          label="Email Address"
          description="Primary email for medical reports"
          onChange={setEmail}
        />
        <FHIRContactPointInput
          variant={variant}
          system="url"
          label="Website URL"
          onChange={setUrl}
        />
        <FHIRContactPointInput
          variant={variant}
          system="sms"
          label="SMS Number"
          onChange={setSms}
        />
        <FHIRContactPointInput
          variant={variant}
          system="fax"
          label="Fax Number"
          onChange={setFax}
        />
        <FHIRContactPointInput
          variant={variant}
          system="pager"
          label="Pager Code"
          onChange={setPager}
        />
        <div className="sm:col-span-2">
          <FHIRContactPointInput
            variant={variant}
            system="other"
            label="Alternative Contact"
            onChange={setOther}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 font-mono text-xs">
        <div className="font-semibold text-muted-foreground mb-2 flex items-center justify-between">
          <span>onChange Outputs (FHIR ContactPoint Objects)</span>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans">JavaScript Objects</span>
        </div>
        <pre className="overflow-x-auto text-foreground max-h-[300px] scrollbar-thin">
          {JSON.stringify(activeChannels, null, 2)}
        </pre>
      </div>
    </div>
  );
}
