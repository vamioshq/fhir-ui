"use client";

import * as React from "react";
import { type Address } from "@medplum/fhirtypes";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldSet, FieldLegend } from "@/components/ui/field";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { SlidersHorizontal } from "lucide-react";
import {
  FHIRRegionalSelector,
  FHIRRegionalSelectorGroup,
  type RegionalItem,
  mockFetchProvinces,
  mockFetchCities,
  mockFetchDistricts,
  mockFetchVillages,
  FHIRCombinedSubdistrictSelector,
  type CombinedSubdistrictItem,
  mockFetchAllSubdistricts,
} from "@/registry/fhir-ui/fhir-regional-selector";
import { FHIRCountrySelector } from "@/registry/fhir-ui/fhir-country-selector";

export interface FHIRAddressInputProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: Address;
  onChange?: (value: Address) => void;
  label?: string;
  variant?: "simple" | "detailed";
  description?: string;
  onFetchProvinces?: (name?: string) => Promise<RegionalItem[]>;
  onFetchCities?: (provinceCode: string, name?: string) => Promise<RegionalItem[]>;
  onFetchDistricts?: (cityCode: string, name?: string) => Promise<RegionalItem[]>;
  onFetchVillages?: (districtCode: string, name?: string) => Promise<RegionalItem[]>;
  onFetchAllSubdistricts?: (query?: string) => Promise<CombinedSubdistrictItem[]>;
}


// Helper to extract Kemkes administrative codes from FHIR extension (supporting complex and flat structures)
function getAdminCode(address: Address | undefined, subUrl: string): string {
  if (!address?.extension) return "";

  // 1. Try official complex nested extension (administrativeCode or legacy administrative-address)
  const complexUrls = [
    "https://fhir.kemkes.go.id/r4/StructureDefinition/administrativeCode",
    "https://fhir.kemkes.go.id/r4/StructureDefinition/administrative-address"
  ];
  for (const url of complexUrls) {
    const adminExt = address.extension.find((e) => e.url === url);
    if (adminExt?.extension) {
      const subExt = adminExt.extension.find((sub) => sub.url === subUrl);
      if (subExt?.valueCode) return subExt.valueCode;
    }
  }

  // 2. Fallback: Parse flat extensions directly on the root extension list
  const flatExt = address.extension.find((e) => e.url === subUrl);
  return flatExt?.valueCode || "";
}

// Helper to construct FHIR compliant Address with Kemkes extensions
function buildFhirAddress(
  line: string[],
  city: string,
  province: string,
  district: string,
  postalCode: string,
  country: string,
  provinceCode: string,
  cityCode: string,
  districtCode: string,
  villageCode: string,
  rt: string,
  rw: string
): Address {
  const cleanLine = line.filter(Boolean);
  const isIndonesian = country.trim().toUpperCase() === "ID";

  // Format RT / RW to be 3 digits (e.g. "005") if they are numeric
  const formattedRt = rt && /^\d+$/.test(rt.trim()) ? rt.trim().padStart(3, "0") : rt.trim();
  const formattedRw = rw && /^\d+$/.test(rw.trim()) ? rw.trim().padStart(3, "0") : rw.trim();

  // Create Kemenkes administrative address sub-extensions (only for Indonesia)
  const subExtensions: Array<{ url: string; valueCode: string }> = [];
  if (isIndonesian) {
    if (provinceCode.trim()) subExtensions.push({ url: "province", valueCode: provinceCode.trim() });
    if (cityCode.trim()) subExtensions.push({ url: "city", valueCode: cityCode.trim() });
    if (districtCode.trim()) subExtensions.push({ url: "district", valueCode: districtCode.trim() });
    if (villageCode.trim()) subExtensions.push({ url: "village", valueCode: villageCode.trim() });
    if (formattedRt) subExtensions.push({ url: "rt", valueCode: formattedRt });
    if (formattedRw) subExtensions.push({ url: "rw", valueCode: formattedRw });
  }

  const extensions = (isIndonesian && subExtensions.length > 0) ? [
    {
      url: "https://fhir.kemkes.go.id/r4/StructureDefinition/administrativeCode",
      extension: subExtensions,
    }
  ] : undefined;

  // Build a readable text dump of the address for clinical logs (stripping RT/RW prefix for international)
  const textParts = isIndonesian ? [
    cleanLine.join(", "),
    formattedRt ? `RT ${formattedRt}` : "",
    formattedRw ? `RW ${formattedRw}` : "",
    city.trim(),
    province.trim(),
    postalCode.trim(),
    country.trim() || "ID"
  ].filter(Boolean) : [
    cleanLine.join(", "),
    city.trim(),
    province.trim(),
    postalCode.trim(),
    country.trim()
  ].filter(Boolean);

  return {
    use: "home",
    type: "both",
    line: cleanLine.length > 0 ? cleanLine : undefined,
    city: city.trim() || undefined,
    district: district.trim() || undefined,
    state: province.trim() || undefined,
    postalCode: postalCode.trim() || undefined,
    country: country.trim() || "ID",
    text: textParts.join(", ") || undefined,
    extension: extensions,
  };
}

export function FHIRAddressInput({
  value,
  onChange,
  label = "Address Information",
  variant = "simple",
  className,
  description,
  onFetchProvinces = mockFetchProvinces,
  onFetchCities = mockFetchCities,
  onFetchDistricts = mockFetchDistricts,
  onFetchVillages = mockFetchVillages,
  onFetchAllSubdistricts = mockFetchAllSubdistricts,
  ...props
}: FHIRAddressInputProps) {
  // Main state fields
  const [streetLine, setStreetLine] = React.useState(value?.line?.[0] || "");
  const [rt, setRt] = React.useState(getAdminCode(value, "rt"));
  const [rw, setRw] = React.useState(getAdminCode(value, "rw"));

  const [province, setProvince] = React.useState(value?.state || "");
  const [provinceCode, setProvinceCode] = React.useState(getAdminCode(value, "province"));

  const [city, setCity] = React.useState(value?.city || "");
  const [cityCode, setCityCode] = React.useState(getAdminCode(value, "city"));

  // District / Kecamatan
  const [district, setDistrict] = React.useState("");
  const [districtCode, setDistrictCode] = React.useState(getAdminCode(value, "district"));

  // Village / Kelurahan
  const [village, setVillage] = React.useState("");
  const [villageCode, setVillageCode] = React.useState(getAdminCode(value, "village"));

  const [postalCode, setPostalCode] = React.useState(value?.postalCode || "");
  const [country, setCountry] = React.useState(value?.country || "ID");

  const isIndonesian = country.trim().toUpperCase() === "ID";

  // Sync state if incoming value prop changes
  React.useEffect(() => {
    if (value) {
      setStreetLine(value.line?.[0] || "");
      setRt(getAdminCode(value, "rt"));
      setRw(getAdminCode(value, "rw"));
      setProvince(value.state || "");
      setProvinceCode(getAdminCode(value, "province"));
      setCity(value.city || "");
      setCityCode(getAdminCode(value, "city"));
      setDistrictCode(getAdminCode(value, "district"));
      setDistrict(value.district || "");
      setVillageCode(getAdminCode(value, "village"));
      setVillage(""); // let group component resolve name
      setPostalCode(value.postalCode || "");
      setCountry(value.country || "ID");
    }
  }, [value]);

  const triggerChange = (
    updatedLine: string,
    updatedRt: string,
    updatedRw: string,
    updatedProvince: string,
    updatedProvCode: string,
    updatedCity: string,
    updatedCityCode: string,
    updatedDistrict: string,
    updatedDistCode: string,
    updatedVillCode: string,
    updatedZip: string,
    updatedCountry: string
  ) => {
    if (!onChange) return;
    const fhirAddr = buildFhirAddress(
      [updatedLine],
      updatedCity,
      updatedProvince,
      updatedDistrict,
      updatedZip,
      updatedCountry,
      updatedProvCode,
      updatedCityCode,
      updatedDistCode,
      updatedVillCode,
      updatedRt,
      updatedRw
    );
    onChange(fhirAddr);
  };


  // Simple Free Text View (if they only want a text-area input)
  const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setStreetLine(val);
    if (!onChange) return;
    onChange({
      use: "home",
      type: "both",
      text: val || undefined,
      line: val ? [val] : undefined,
      country: "ID"
    });
  };

  return (
    <TooltipProvider>
      <div className={cn(className)} {...props}>
        {variant === "detailed" ? (
          <FieldSet>
            <FieldLegend className="font-semibold text-sm leading-tight border-b pb-2 w-full">
              {label}
            </FieldLegend>
            {description && <FieldDescription>{description}</FieldDescription>}

            {/* Country Selector (Top) */}
            <FHIRCountrySelector
              valueCode={country}
              onChange={(code) => {
                setCountry(code);
                triggerChange(streetLine, rt, rw, province, provinceCode, city, cityCode, district, districtCode, villageCode, postalCode, code);
              }}
            />

            {/* Street Address Line */}
            <Field>
              <FieldLabel htmlFor="street-address">Street Address (Alamat Jalan)</FieldLabel>
              <Input
                id="street-address"
                placeholder={isIndonesian ? "e.g., Jl. Jenderal Sudirman No. 21" : "e.g., 123 Main St"}
                value={streetLine}
                onChange={(e) => {
                  setStreetLine(e.target.value);
                  triggerChange(e.target.value, rt, rw, province, provinceCode, city, cityCode, district, districtCode, villageCode, postalCode, country);
                }}
              />
            </Field>

            {isIndonesian ? (
              <>
                {/* RT & RW */}
                <div className="grid gap-4 grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="rt-code">RT</FieldLabel>
                    <Input
                      id="rt-code"
                      placeholder="e.g., 005"
                      maxLength={3}
                      value={rt}
                      onChange={(e) => {
                        setRt(e.target.value);
                        triggerChange(streetLine, e.target.value, rw, province, provinceCode, city, cityCode, district, districtCode, villageCode, postalCode, country);
                      }}
                      onBlur={() => {
                        if (rt && /^\d+$/.test(rt.trim())) {
                          const padded = rt.trim().padStart(3, "0");
                          setRt(padded);
                          triggerChange(streetLine, padded, rw, province, provinceCode, city, cityCode, district, districtCode, villageCode, postalCode, country);
                        }
                      }}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="rw-code">RW</FieldLabel>
                    <Input
                      id="rw-code"
                      placeholder="e.g., 002"
                      maxLength={3}
                      value={rw}
                      onChange={(e) => {
                        setRw(e.target.value);
                        triggerChange(streetLine, rt, e.target.value, province, provinceCode, city, cityCode, district, districtCode, villageCode, postalCode, country);
                      }}
                      onBlur={() => {
                        if (rw && /^\d+$/.test(rw.trim())) {
                          const padded = rw.trim().padStart(3, "0");
                          setRw(padded);
                          triggerChange(streetLine, rt, padded, province, provinceCode, city, cityCode, district, districtCode, villageCode, postalCode, country);
                        }
                      }}
                    />
                  </Field>
                </div>

                {/* Reusable FHIR Regional Selector Group */}
                <FHIRRegionalSelectorGroup
                  province={province}
                  provinceCode={provinceCode}
                  city={city}
                  cityCode={cityCode}
                  district={district}
                  districtCode={districtCode}
                  village={village}
                  villageCode={villageCode}
                  onFetchProvinces={onFetchProvinces}
                  onFetchCities={onFetchCities}
                  onFetchDistricts={onFetchDistricts}
                  onFetchVillages={onFetchVillages}
                  onChange={(vals) => {
                    setProvince(vals.province);
                    setProvinceCode(vals.provinceCode);
                    setCity(vals.city);
                    setCityCode(vals.cityCode);
                    setDistrict(vals.district);
                    setDistrictCode(vals.districtCode);
                    setVillage(vals.village);
                    setVillageCode(vals.villageCode);
                    triggerChange(
                      streetLine,
                      rt,
                      rw,
                      vals.province,
                      vals.provinceCode,
                      vals.city,
                      vals.cityCode,
                      vals.district,
                      vals.districtCode,
                      vals.villageCode,
                      postalCode,
                      country
                    );
                  }}
                />

                {/* ZIP / Postal Code */}
                <Field>
                  <FieldLabel htmlFor="postal-code">ZIP / Postal Code</FieldLabel>
                  <Input
                    id="postal-code"
                    placeholder="e.g., 12730"
                    value={postalCode}
                    onChange={(e) => {
                      setPostalCode(e.target.value);
                      triggerChange(streetLine, rt, rw, province, provinceCode, city, cityCode, district, districtCode, villageCode, e.target.value, country);
                    }}
                  />
                </Field>
              </>
            ) : (
              <>
                {/* State/Province & City */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="state-province">State / Province</FieldLabel>
                    <Input
                      id="state-province"
                      placeholder="e.g., California"
                      value={province}
                      onChange={(e) => {
                        setProvince(e.target.value);
                        triggerChange(streetLine, rt, rw, e.target.value, provinceCode, city, cityCode, district, districtCode, villageCode, postalCode, country);
                      }}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="city">City</FieldLabel>
                    <Input
                      id="city"
                      placeholder="e.g., Los Angeles"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        triggerChange(streetLine, rt, rw, province, provinceCode, e.target.value, cityCode, district, districtCode, villageCode, postalCode, country);
                      }}
                    />
                  </Field>
                </div>

                {/* District/County & ZIP / Postal Code */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="district">District / County</FieldLabel>
                    <Input
                      id="district"
                      placeholder="e.g., Westwood"
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value);
                        triggerChange(streetLine, rt, rw, province, provinceCode, city, cityCode, e.target.value, districtCode, villageCode, postalCode, country);
                      }}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="postal-code">ZIP / Postal Code</FieldLabel>
                    <Input
                      id="postal-code"
                      placeholder="e.g., 90024"
                      value={postalCode}
                      onChange={(e) => {
                        setPostalCode(e.target.value);
                        triggerChange(streetLine, rt, rw, province, provinceCode, city, cityCode, district, districtCode, villageCode, e.target.value, country);
                      }}
                    />
                  </Field>
                </div>
              </>
            )}

          </FieldSet>
        ) : (
          <FieldSet>
            <FieldLegend className="font-semibold text-sm leading-tight border-b pb-2 w-full">
              {label}
            </FieldLegend>
            {description && <FieldDescription>{description}</FieldDescription>}

            {/* Street Address Line */}
            <Field>
              <FieldLabel htmlFor="simple-street-address">Street Address (Alamat Jalan)</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="simple-street-address"
                  placeholder="e.g., Jl. Jenderal Sudirman No. 21, RT 005/RW 002"
                  value={streetLine}
                  onChange={(e) => {
                    setStreetLine(e.target.value);
                    triggerChange(e.target.value, rt, rw, province, provinceCode, city, cityCode, district, districtCode, villageCode, postalCode, country);
                  }}
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
                        <DialogTitle>Edit Address Details</DialogTitle>
                      </DialogHeader>
                      <div className="py-2 space-y-4">
                        {/* Country Selector (Top) */}
                        <FHIRCountrySelector
                          valueCode={country}
                          onChange={(code) => {
                            setCountry(code);
                            triggerChange(streetLine, rt, rw, province, provinceCode, city, cityCode, district, districtCode, villageCode, postalCode, code);
                          }}
                        />

                        {/* Street Address Line */}
                        <Field>
                          <FieldLabel htmlFor="dialog-street-address">Street Address (Alamat Jalan)</FieldLabel>
                          <Input
                            id="dialog-street-address"
                            placeholder={isIndonesian ? "e.g., Jl. Jenderal Sudirman No. 21" : "e.g., 123 Main St"}
                            value={streetLine}
                            onChange={(e) => {
                              setStreetLine(e.target.value);
                              triggerChange(e.target.value, rt, rw, province, provinceCode, city, cityCode, district, districtCode, villageCode, postalCode, country);
                            }}
                          />
                        </Field>

                        {isIndonesian ? (
                          <>
                            {/* RT & RW */}
                            <div className="grid gap-4 grid-cols-2">
                              <Field>
                                <FieldLabel htmlFor="dialog-rt-code">RT</FieldLabel>
                                <Input
                                  id="dialog-rt-code"
                                  placeholder="e.g., 005"
                                  maxLength={3}
                                  value={rt}
                                  onChange={(e) => {
                                    setRt(e.target.value);
                                    triggerChange(streetLine, e.target.value, rw, province, provinceCode, city, cityCode, district, districtCode, villageCode, postalCode, country);
                                  }}
                                  onBlur={() => {
                                    if (rt && /^\d+$/.test(rt.trim())) {
                                      const padded = rt.trim().padStart(3, "0");
                                      setRt(padded);
                                      triggerChange(streetLine, padded, rw, province, provinceCode, city, cityCode, district, districtCode, villageCode, postalCode, country);
                                    }
                                  }}
                                />
                              </Field>

                              <Field>
                                <FieldLabel htmlFor="dialog-rw-code">RW</FieldLabel>
                                <Input
                                  id="dialog-rw-code"
                                  placeholder="e.g., 002"
                                  maxLength={3}
                                  value={rw}
                                  onChange={(e) => {
                                    setRw(e.target.value);
                                    triggerChange(streetLine, rt, e.target.value, province, provinceCode, city, cityCode, district, districtCode, villageCode, postalCode, country);
                                  }}
                                  onBlur={() => {
                                    if (rw && /^\d+$/.test(rw.trim())) {
                                      const padded = rw.trim().padStart(3, "0");
                                      setRw(padded);
                                      triggerChange(streetLine, rt, padded, province, provinceCode, city, cityCode, district, districtCode, villageCode, postalCode, country);
                                    }
                                  }}
                                />
                              </Field>
                            </div>

                            {/* Reusable FHIR Regional Selector Group */}
                            <FHIRRegionalSelectorGroup
                              province={province}
                              provinceCode={provinceCode}
                              city={city}
                              cityCode={cityCode}
                              district={district}
                              districtCode={districtCode}
                              village={village}
                              villageCode={villageCode}
                              onFetchProvinces={onFetchProvinces}
                              onFetchCities={onFetchCities}
                              onFetchDistricts={onFetchDistricts}
                              onFetchVillages={onFetchVillages}
                              onChange={(vals) => {
                                setProvince(vals.province);
                                setProvinceCode(vals.provinceCode);
                                setCity(vals.city);
                                setCityCode(vals.cityCode);
                                setDistrict(vals.district);
                                setDistrictCode(vals.districtCode);
                                setVillage(vals.village);
                                setVillageCode(vals.villageCode);
                                triggerChange(
                                  streetLine,
                                  rt,
                                  rw,
                                  vals.province,
                                  vals.provinceCode,
                                  vals.city,
                                  vals.cityCode,
                                  vals.district,
                                  vals.districtCode,
                                  vals.villageCode,
                                  postalCode,
                                  country
                                );
                              }}
                            />

                            {/* ZIP / Postal Code */}
                            <Field>
                              <FieldLabel htmlFor="dialog-postal-code">ZIP / Postal Code</FieldLabel>
                              <Input
                                id="dialog-postal-code"
                                placeholder="e.g., 12730"
                                value={postalCode}
                                onChange={(e) => {
                                  setPostalCode(e.target.value);
                                  triggerChange(streetLine, rt, rw, province, provinceCode, city, cityCode, district, districtCode, villageCode, e.target.value, country);
                                }}
                              />
                            </Field>
                          </>
                        ) : (
                          <>
                            {/* State/Province & City */}
                            <div className="grid gap-4 md:grid-cols-2">
                              <Field>
                                <FieldLabel htmlFor="dialog-state-province">State / Province</FieldLabel>
                                <Input
                                  id="dialog-state-province"
                                  placeholder="e.g., California"
                                  value={province}
                                  onChange={(e) => {
                                    setProvince(e.target.value);
                                    triggerChange(streetLine, rt, rw, e.target.value, provinceCode, city, cityCode, district, districtCode, villageCode, postalCode, country);
                                  }}
                                />
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="dialog-city">City</FieldLabel>
                                <Input
                                  id="dialog-city"
                                  placeholder="e.g., Los Angeles"
                                  value={city}
                                  onChange={(e) => {
                                    setCity(e.target.value);
                                    triggerChange(streetLine, rt, rw, province, provinceCode, e.target.value, cityCode, district, districtCode, villageCode, postalCode, country);
                                  }}
                                />
                              </Field>
                            </div>

                            {/* District/County & ZIP / Postal Code */}
                            <div className="grid gap-4 md:grid-cols-2">
                              <Field>
                                <FieldLabel htmlFor="dialog-district">District / County</FieldLabel>
                                <Input
                                  id="dialog-district"
                                  placeholder="e.g., Westwood"
                                  value={district}
                                  onChange={(e) => {
                                    setDistrict(e.target.value);
                                    triggerChange(streetLine, rt, rw, province, provinceCode, city, cityCode, e.target.value, districtCode, villageCode, postalCode, country);
                                  }}
                                />
                              </Field>
                              <Field>
                                <FieldLabel htmlFor="dialog-postal-code">ZIP / Postal Code</FieldLabel>
                                <Input
                                  id="dialog-postal-code"
                                  placeholder="e.g., 90024"
                                  value={postalCode}
                                  onChange={(e) => {
                                    setPostalCode(e.target.value);
                                    triggerChange(streetLine, rt, rw, province, provinceCode, city, cityCode, district, districtCode, villageCode, e.target.value, country);
                                  }}
                                />
                              </Field>
                            </div>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </InputGroupAddon>
              </InputGroup>
            </Field>

            {/* Combined Subdistrict Combobox (Only for Indonesia) */}
            <FHIRCombinedSubdistrictSelector
              valueCode={villageCode}
              valueFullName={
                province && city && district && village
                  ? `${province}, ${city}, ${district}, ${village}`
                  : ""
              }
              onChange={(item) => {
                setProvince(item.provinceName);
                setProvinceCode(item.provinceCode);
                setCity(item.cityName);
                setCityCode(item.cityCode);
                setDistrict(item.districtName);
                setDistrictCode(item.districtCode);
                setVillage(item.name);
                setVillageCode(item.code);

                if (onChange) {
                  const fhirAddr = buildFhirAddress(
                    [streetLine],
                    item.cityName,
                    item.provinceName,
                    item.districtName,
                    postalCode,
                    country,
                    item.provinceCode,
                    item.cityCode,
                    item.districtCode,
                    item.code,
                    rt,
                    rw
                  );
                  onChange(fhirAddr);
                }
              }}
              onFetchData={onFetchAllSubdistricts}
            />
          </FieldSet>
        )}
      </div>
    </TooltipProvider>
  );
}
