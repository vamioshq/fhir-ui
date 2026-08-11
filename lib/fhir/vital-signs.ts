import type { Observation, ObservationComponent } from "@medplum/fhirtypes";

export interface VitalSignsState {
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  spo2?: number;
  weight?: number;
  height?: number;
  waistCircumference?: number;
}

const LOINC = "http://loinc.org";
const UCUM = "http://unitsofmeasure.org";

export function observationsToVitalSigns(observations: readonly Observation[]): VitalSignsState {
  const state: VitalSignsState = {};
  for (const observation of observations) {
    const code = observation.code?.coding?.find((coding) => coding.system === LOINC)?.code
      ?? observation.code?.coding?.[0]?.code;
    if (code === "85354-9") {
      for (const component of observation.component ?? []) {
        const componentCode = component.code?.coding?.find((coding) => coding.system === LOINC)?.code
          ?? component.code?.coding?.[0]?.code;
        if (componentCode === "8480-6") state.systolic = component.valueQuantity?.value;
        if (componentCode === "8462-4") state.diastolic = component.valueQuantity?.value;
      }
    } else if (code === "8867-4") state.heartRate = observation.valueQuantity?.value;
    else if (code === "8310-5") state.temperature = observation.valueQuantity?.value;
    else if (code === "9279-1") state.respiratoryRate = observation.valueQuantity?.value;
    else if (code === "2708-6") state.spo2 = observation.valueQuantity?.value;
    else if (code === "29463-7") state.weight = observation.valueQuantity?.value;
    else if (code === "8302-2") state.height = observation.valueQuantity?.value;
    else if (code === "8280-0") state.waistCircumference = observation.valueQuantity?.value;
  }
  return state;
}

export interface VitalSignsContext {
  patientId: string;
  encounterId?: string;
  effectiveDateTime?: string;
  idFactory?: (code: string) => string;
}

export function vitalSignsToObservations(state: VitalSignsState, context: VitalSignsContext): Observation[] {
  const effectiveDateTime = context.effectiveDateTime ?? new Date().toISOString();
  const idFactory = context.idFactory ?? ((code) => `obs-${code}-${Date.now()}`);
  const common = (code: string) => ({
    resourceType: "Observation" as const,
    id: idFactory(code),
    status: "final" as const,
    category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs", display: "Vital Signs" }] }],
    subject: { reference: `Patient/${context.patientId}` },
    encounter: context.encounterId ? { reference: `Encounter/${context.encounterId}` } : undefined,
    effectiveDateTime,
  });
  const quantity = (code: string, display: string, value: number, unitCode: string, unit: string): Observation => ({
    ...common(code),
    code: { coding: [{ system: LOINC, code, display }], text: display },
    valueQuantity: { value, unit, system: UCUM, code: unitCode },
  });
  const result: Observation[] = [];

  const components: ObservationComponent[] = [];
  if (state.systolic !== undefined) components.push({ code: { coding: [{ system: LOINC, code: "8480-6", display: "Systolic blood pressure" }] }, valueQuantity: { value: state.systolic, unit: "mmHg", system: UCUM, code: "mm[Hg]" } });
  if (state.diastolic !== undefined) components.push({ code: { coding: [{ system: LOINC, code: "8462-4", display: "Diastolic blood pressure" }] }, valueQuantity: { value: state.diastolic, unit: "mmHg", system: UCUM, code: "mm[Hg]" } });
  if (components.length) result.push({ ...common("bp"), code: { coding: [{ system: LOINC, code: "85354-9", display: "Blood pressure panel with all children" }], text: "Blood Pressure" }, component: components });
  if (state.heartRate !== undefined) result.push(quantity("8867-4", "Heart rate", state.heartRate, "/min", "bpm"));
  if (state.temperature !== undefined) result.push(quantity("8310-5", "Body temperature", state.temperature, "Cel", "°C"));
  if (state.respiratoryRate !== undefined) result.push(quantity("9279-1", "Respiratory rate", state.respiratoryRate, "/min", "breaths/min"));
  if (state.spo2 !== undefined) result.push(quantity("2708-6", "Oxygen saturation in Arterial blood by Pulse oximetry", state.spo2, "%", "%"));
  if (state.weight !== undefined) result.push(quantity("29463-7", "Body weight", state.weight, "kg", "kg"));
  if (state.height !== undefined) result.push(quantity("8302-2", "Body height", state.height, "cm", "cm"));
  if (state.weight !== undefined && state.height !== undefined && state.height > 0) {
    const bmi = Number((state.weight / ((state.height / 100) ** 2)).toFixed(1));
    result.push(quantity("39156-5", "Body mass index", bmi, "kg/m2", "kg/m²"));
  }
  if (state.waistCircumference !== undefined) result.push(quantity("8280-0", "Waist Circumference", state.waistCircumference, "cm", "cm"));
  return result;
}
