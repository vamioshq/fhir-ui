"use client";

import React from "react";
import { PatientRegistrationForm } from "@/registry/fhir-ui/patient-registration-form";

export function PatientRegistrationFormDemo() {
  return (
    <div className="w-full flex justify-center items-center py-6">
      <PatientRegistrationForm />
    </div>
  );
}
