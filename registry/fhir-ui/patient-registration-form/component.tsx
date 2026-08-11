"use client";

import * as React from "react";
import type { Patient } from "@medplum/fhirtypes";
import { AlertCircle, CheckCircle2, Copy, RefreshCw, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { FHIRAddressInput } from "@/registry/fhir-ui/fhir-address-input";
import { FHIRCitizenshipStatusInput } from "@/registry/fhir-ui/fhir-citizenship-status-input";
import { FHIRContactPointInput } from "@/registry/fhir-ui/fhir-contact-point-input";
import { FHIRDateInput } from "@/registry/fhir-ui/fhir-date-input";
import { FHIRGenderInput } from "@/registry/fhir-ui/fhir-gender-input";
import { FHIRHumanNameInput } from "@/registry/fhir-ui/fhir-human-name-input";
import { FHIRIdentifierInput } from "@/registry/fhir-ui/fhir-identifier-input";
import { FHIRMaritalStatusInput } from "@/registry/fhir-ui/fhir-marital-status-input";
import { FHIRReligionInput } from "@/registry/fhir-ui/fhir-religion-input";
import {
  assemblePatient,
  type PatientRegistrationValues,
  type RegistrationIssue,
  validatePatientRegistration,
  valuesFromPatient,
} from "./patient-registration-validation";

export type { RegistrationIssue } from "./patient-registration-validation";

export interface PatientRegistrationFormProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSubmit"> {
  initialPatient?: Patient;
  onSubmit: (patient: Patient) => Promise<void>;
  validateResource?: (patient: Patient) => Promise<RegistrationIssue[]>;
  readOnly?: boolean;
}

const fieldTargets: Record<RegistrationIssue["path"], string> = {
  name: "simple-name-input",
  identifier: "simple-id-input",
  birthDate: "registration-birth-date",
  gender: "registration-gender",
  telecom: "simple-contact-input",
  address: "street-address",
  resource: "registration-form",
};

export function PatientRegistrationForm({ initialPatient, onSubmit, validateResource, readOnly = false, className, ...props }: PatientRegistrationFormProps) {
  const [values, setValues] = React.useState<PatientRegistrationValues>(() => valuesFromPatient(initialPatient));
  const [issues, setIssues] = React.useState<RegistrationIssue[]>([]);
  const [payload, setPayload] = React.useState<Patient | null>(null);
  const [status, setStatus] = React.useState<"idle" | "validating" | "submitting" | "success" | "error" | "warning">("idle");
  const [submitMessage, setSubmitMessage] = React.useState("");

  const update = <K extends keyof PatientRegistrationValues>(key: K, value: PatientRegistrationValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setIssues((current) => current.filter((item) => item.path !== key));
    if (status !== "submitting") setStatus("idle");
  };

  const focusIssue = (nextIssues: RegistrationIssue[]) => {
    const target = document.getElementById(fieldTargets[nextIssues[0]?.path ?? "resource"]);
    window.setTimeout(() => target?.focus(), 0);
  };

  const submitPatient = async (patient: Patient) => {
    setStatus("submitting");
    try {
      await onSubmit(patient);
      setPayload(patient);
      setStatus("success");
      setSubmitMessage("Data pasien berhasil diproses.");
    } catch {
      setStatus("error");
      setSubmitMessage("Data belum berhasil diproses. Periksa koneksi lalu coba lagi.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const localIssues = validatePatientRegistration(values);
    if (localIssues.length) {
      setIssues(localIssues);
      setStatus("idle");
      focusIssue(localIssues);
      return;
    }

    const patient = assemblePatient(values);
    setPayload(patient);
    setStatus("validating");
    let externalIssues: RegistrationIssue[] = [];
    try {
      externalIssues = validateResource ? await validateResource(patient) : [];
    } catch {
      setStatus("error");
      setSubmitMessage("Validasi server tidak dapat diselesaikan. Data yang sudah diisi tetap tersimpan.");
      return;
    }
    const errors = externalIssues.filter((item) => item.severity === "error");
    if (errors.length) {
      setIssues(externalIssues);
      setStatus("idle");
      focusIssue(errors);
      return;
    }
    if (externalIssues.length) {
      setIssues(externalIssues);
      setStatus("warning");
      return;
    }
    await submitPatient(patient);
  };

  const errorFor = (path: RegistrationIssue["path"]) => issues.find((item) => item.path === path && item.severity === "error");
  const busy = status === "validating" || status === "submitting";

  return (
    <div className={cn("grid w-full max-w-5xl items-start gap-6 md:grid-cols-5", className)} {...props}>
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus aria-hidden="true" />Pendaftaran Pasien</CardTitle>
          <CardDescription>Isi data pasien untuk kunjungan rawat jalan. Kolom bertanda wajib harus dilengkapi.</CardDescription>
        </CardHeader>
        <form id="registration-form" tabIndex={-1} noValidate onSubmit={handleSubmit}>
          <fieldset disabled={readOnly} className="contents">
          <CardContent className="flex flex-col gap-6">
            {issues.length > 0 && (
              <Alert variant={issues.some((item) => item.severity === "error") ? "destructive" : "default"}>
                <AlertCircle aria-hidden="true" />
                <AlertTitle>{status === "warning" ? "Periksa kemungkinan data ganda" : "Periksa data berikut"}</AlertTitle>
                <AlertDescription><ul className="list-disc pl-4">{issues.map((item, index) => <li key={`${item.code}-${index}`}><a href={`#${fieldTargets[item.path]}`}>{item.message}</a></li>)}</ul></AlertDescription>
              </Alert>
            )}

            <div data-invalid={Boolean(errorFor("name"))}><FHIRHumanNameInput value={values.name} onChange={(value) => update("name", value)} label="Nama lengkap *" />{errorFor("name") && <p className="text-xs text-destructive">{errorFor("name")?.message}</p>}</div>
            <div data-invalid={Boolean(errorFor("identifier"))}><FHIRIdentifierInput value={values.identifier} onChange={(value) => update("identifier", value)} preset="nik" label="NIK (opsional)" description="Boleh dikosongkan untuk bayi baru lahir, pasien asing, atau pasien tanpa identitas." />{errorFor("identifier") && <p className="text-xs text-destructive">{errorFor("identifier")?.message}</p>}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div data-invalid={Boolean(errorFor("birthDate"))}><FHIRDateInput controlId="registration-birth-date" value={values.birthDate} onChange={(value) => update("birthDate", value)} showLabel label="Tanggal lahir *" readOnly={readOnly} />{errorFor("birthDate") && <p className="text-xs text-destructive">{errorFor("birthDate")?.message}</p>}</div>
              <div data-invalid={Boolean(errorFor("gender"))}><FHIRGenderInput controlId="registration-gender" value={values.gender} onChange={(value) => update("gender", value)} showLabel label="Jenis kelamin administratif *" variant="select" readOnly={readOnly} />{errorFor("gender") && <p className="text-xs text-destructive">{errorFor("gender")?.message}</p>}</div>
            </div>
            <div data-invalid={Boolean(errorFor("telecom"))}><FHIRContactPointInput value={values.phone} onChange={(value) => update("phone", value)} label="Nomor telepon *" system="phone" use="mobile" />{errorFor("telecom") && <p className="text-xs text-destructive">{errorFor("telecom")?.message}</p>}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FHIRCitizenshipStatusInput value={values.citizenship} onChange={(value) => update("citizenship", value)} showLabel label="Kewarganegaraan (opsional)" variant="select" readOnly={readOnly} />
              <FHIRReligionInput value={values.religion} onChange={(value) => update("religion", value)} showLabel label="Agama (opsional)" variant="select" readOnly={readOnly} />
            </div>
            <FHIRMaritalStatusInput value={values.maritalStatus} onChange={(value) => update("maritalStatus", value)} showLabel label="Status perkawinan (opsional)" variant="toggle" readOnly={readOnly} />
            <div data-invalid={Boolean(errorFor("address"))}><FHIRAddressInput value={values.address} onChange={(value) => update("address", value)} label="Alamat domisili *" variant="detailed" />{errorFor("address") && <p className="text-xs text-destructive">{errorFor("address")?.message}</p>}</div>

            {status === "success" && <Alert><CheckCircle2 aria-hidden="true" /><AlertTitle>Berhasil</AlertTitle><AlertDescription>{submitMessage}</AlertDescription></Alert>}
            {status === "error" && <Alert variant="destructive"><AlertCircle aria-hidden="true" /><AlertTitle>Pengiriman gagal</AlertTitle><AlertDescription>{submitMessage}</AlertDescription></Alert>}
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-3 border-t">
            <span className="text-xs text-muted-foreground">FHIR-shaped dan SATUSEHAT-mapped; validasi server tetap diperlukan.</span>
            <div className="flex gap-2">
              {status === "error" && <Button type="submit" variant="outline" disabled={busy || readOnly}><RefreshCw data-icon="inline-start" />Coba lagi</Button>}
              {status === "warning" && payload && <Button type="button" variant="outline" onClick={() => submitPatient(payload)} disabled={busy || readOnly}>Tetap lanjutkan</Button>}
              <Button type="submit" disabled={busy || readOnly}>{busy && <Spinner data-icon="inline-start" />}{busy ? "Memproses..." : "Simpan pasien"}</Button>
            </div>
          </CardFooter>
          </fieldset>
        </form>
      </Card>

      <Card className="flex min-h-[500px] flex-col md:col-span-2">
        <CardHeader><CardTitle>Pratinjau FHIR Patient</CardTitle><CardDescription>Resource yang akan dikirim ke integrasi aplikasi.</CardDescription></CardHeader>
        <CardContent className="flex-1"><div className="h-full max-h-[620px] overflow-auto rounded-lg border bg-muted/40 p-4 text-xs">{payload ? <><Button type="button" variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(JSON.stringify(payload, null, 2))}><Copy data-icon="inline-start" />Salin JSON</Button><pre className="whitespace-pre-wrap">{JSON.stringify(payload, null, 2)}</pre></> : <p className="text-muted-foreground">Pratinjau akan muncul setelah data lolos pemeriksaan lokal.</p>}</div></CardContent>
      </Card>
    </div>
  );
}
