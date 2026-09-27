"use client";

import * as React from "react";
import type { Address, Patient } from "@medplum/fhirtypes";
import { useSearchParams } from "next/navigation";
import { FHIRAddressInput } from "@/registry/fhir-ui/fhir-address-input";
import { FHIRDateInput } from "@/registry/fhir-ui/fhir-date-input";
import { FHIRDateTimeInput } from "@/registry/fhir-ui/fhir-datetime-input";
import { PatientRegistrationForm } from "@/registry/fhir-ui/patient-registration-form";

function E2EHarnessPage() {
  const searchParams = useSearchParams();
  const [date, setDate] = React.useState("1990-05-15");
  const [dateTime, setDateTime] = React.useState("2026-06-05T02:35:00+07:00");
  const [address, setAddress] = React.useState<Address>({});
  const [patient, setPatient] = React.useState<Patient | null>(null);
  const [submitAttempts, setSubmitAttempts] = React.useState(0);
  // Set after hydration, so tests can wait for client-side ARIA wiring (such as combobox labels).
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  const registrationMode = searchParams.get("registration") ?? "success";
  const initialPatient: Patient = {
    resourceType: "Patient",
    name: [{ use: "official", text: "Siti Aminah", given: ["Siti"], family: "Aminah" }],
    birthDate: "1990-05-15",
    gender: "female",
    telecom: [{ system: "phone", use: "mobile", value: "081234567890" }],
    address: [{ use: "home", line: ["Jl. Merdeka 10"], city: "Jakarta", country: "ID" }],
  };

  const submitRegistration = async (value: Patient) => {
    const nextAttempt = submitAttempts + 1;
    setSubmitAttempts(nextAttempt);
    if (registrationMode === "failure" && nextAttempt === 1) throw new Error("simulated failure");
    setPatient(value);
  };

  return (
    <main data-hydrated={hydrated || undefined} className="mx-auto flex max-w-3xl flex-col gap-10 p-6 sm:p-10">
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
        <PatientRegistrationForm
          initialPatient={initialPatient}
          onSubmit={submitRegistration}
          readOnly={registrationMode === "readonly"}
          validateResource={registrationMode === "duplicate"
            ? async () => [{ path: "resource", code: "duplicate", severity: "warning", message: "Kemungkinan pasien sudah terdaftar." }]
            : registrationMode === "validation-error"
              ? async () => [{ path: "name", code: "server-rejected", severity: "error", message: "Nama ditolak oleh validator uji." }]
              : undefined}
        />
        <output data-testid="patient-output">
          <pre>{patient ? JSON.stringify(patient) : ""}</pre>
        </output>
        <output data-testid="submit-attempts">{submitAttempts}</output>
      </section>
    </main>
  );
}

export default function E2EPage() {
  return (
    <React.Suspense fallback={<main className="p-6">Loading testbed…</main>}>
      <E2EHarnessPage />
    </React.Suspense>
  );
}
