"use client";

import * as React from "react";
import type { Address, Patient } from "@medplum/fhirtypes";
import { FHIRAddressInput } from "@/registry/fhir-ui/fhir-address-input";
import { FHIRDateInput } from "@/registry/fhir-ui/fhir-date-input";
import { FHIRDateTimeInput } from "@/registry/fhir-ui/fhir-datetime-input";
import { PatientRegistrationForm } from "@/registry/fhir-ui/patient-registration-form";

export default function E2EHarnessPage() {
  const [date, setDate] = React.useState("1990-05-15");
  const [dateTime, setDateTime] = React.useState("2026-06-05T02:35:00+07:00");
  const [address, setAddress] = React.useState<Address>({});
  const [patient, setPatient] = React.useState<Patient | null>(null);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 p-6 sm:p-10">
      <h1 className="text-2xl font-semibold">FHIR UI interaction testbed</h1>
      <section data-testid="date-section" className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Date</h2>
        <FHIRDateInput value={date} onChange={setDate} showLabel label="Patient Date of Birth" />
        <output data-testid="date-output">{date}</output>
      </section>
      <section data-testid="datetime-section" className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">DateTime</h2>
        <FHIRDateTimeInput value={dateTime} onChange={setDateTime} showLabel label="Encounter Date and Time" />
        <output data-testid="datetime-output">{dateTime}</output>
      </section>
      <section data-testid="address-section" className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Address</h2>
        <FHIRAddressInput value={address} onChange={setAddress} variant="simple" />
        <output data-testid="address-output"><pre>{JSON.stringify(address)}</pre></output>
      </section>
      <section data-testid="registration-section" className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Patient registration</h2>
        <PatientRegistrationForm onSubmitSuccess={setPatient} />
        <output data-testid="patient-output">
          <pre>{patient ? JSON.stringify(patient) : ""}</pre>
        </output>
      </section>
    </main>
  );
}
