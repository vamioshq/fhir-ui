import type { Address, ContactPoint, Extension, HumanName, Identifier, Patient } from "@medplum/fhirtypes";

function isFHIRDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const candidate = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return candidate.getUTCFullYear() === Number(match[1]) && candidate.getUTCMonth() === Number(match[2]) - 1 && candidate.getUTCDate() === Number(match[3]);
}

export type RegistrationIssueSeverity = "error" | "warning";

export interface RegistrationIssue {
  path: "name" | "identifier" | "birthDate" | "gender" | "telecom" | "address" | "resource";
  code: string;
  severity: RegistrationIssueSeverity;
  message: string;
}

export interface PatientRegistrationValues {
  name?: HumanName;
  identifier?: Identifier;
  birthDate: string;
  gender?: Patient["gender"];
  phone?: ContactPoint;
  address?: Address;
  citizenship?: Extension;
  religion?: Extension;
  maritalStatus?: Patient["maritalStatus"];
}

const issue = (path: RegistrationIssue["path"], code: string, message: string): RegistrationIssue => ({
  path,
  code,
  severity: "error",
  message,
});

export function valuesFromPatient(patient?: Patient): PatientRegistrationValues {
  const extensions = patient?.extension ?? [];
  return {
    name: patient?.name?.[0],
    identifier: patient?.identifier?.[0],
    birthDate: patient?.birthDate ?? "",
    gender: patient?.gender,
    phone: patient?.telecom?.find((contact) => contact.system === "phone"),
    address: patient?.address?.[0],
    citizenship: extensions.find((extension) => extension.url.includes("citizenship")),
    religion: extensions.find((extension) => extension.url.includes("religion")),
    maritalStatus: patient?.maritalStatus,
  };
}

export function validatePatientRegistration(values: PatientRegistrationValues, today = new Date()): RegistrationIssue[] {
  const issues: RegistrationIssue[] = [];
  if (!values.name?.text?.trim()) issues.push(issue("name", "required", "Nama lengkap wajib diisi."));
  if (!values.birthDate) {
    issues.push(issue("birthDate", "required", "Tanggal lahir wajib diisi."));
  } else if (!isFHIRDate(values.birthDate)) {
    issues.push(issue("birthDate", "invalid", "Tanggal lahir tidak valid."));
  } else {
    const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (values.birthDate > todayDate) issues.push(issue("birthDate", "future", "Tanggal lahir tidak boleh di masa depan."));
  }
  if (!values.gender) issues.push(issue("gender", "required", "Jenis kelamin administratif wajib dipilih."));

  const phone = values.phone?.value?.trim() ?? "";
  if (!phone) issues.push(issue("telecom", "required", "Nomor telepon wajib diisi."));
  else if (!/^\+?[\d\s().-]+$/.test(phone) || phone.replace(/\D/g, "").length < 8) issues.push(issue("telecom", "invalid", "Nomor telepon harus berisi minimal 8 digit dan karakter telepon yang valid."));

  if (!values.address?.line?.some((line) => line.trim())) {
    issues.push(issue("address", "required-line", "Alamat jalan wajib diisi."));
  }
  if (!values.address?.city?.trim() && !values.address?.district?.trim()) {
    issues.push(issue("address", "required-area", "Kota atau kabupaten wajib diisi."));
  }

  const nik = values.identifier?.value?.trim();
  if (nik && !/^\d{16}$/.test(nik)) issues.push(issue("identifier", "invalid-nik", "NIK harus terdiri dari 16 digit."));
  return issues;
}

export function assemblePatient(values: PatientRegistrationValues): Patient {
  const extension = [values.citizenship, values.religion].filter((value): value is Extension => Boolean(value));
  return {
    resourceType: "Patient",
    active: true,
    name: values.name ? [values.name] : undefined,
    identifier: values.identifier?.value ? [values.identifier] : undefined,
    birthDate: values.birthDate || undefined,
    gender: values.gender,
    telecom: values.phone?.value ? [values.phone] : undefined,
    address: values.address ? [values.address] : undefined,
    maritalStatus: values.maritalStatus,
    extension: extension.length ? extension : undefined,
  };
}
