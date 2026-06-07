"use client";

import React, { useState } from "react";
import { FHIRRegionalSelector, type RegionalItem } from "@/registry/fhir-ui/fhir-regional-selector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Mock data for Indonesian regions
const mockProvinces: RegionalItem[] = [
  { code: "11", name: "Aceh" },
  { code: "12", name: "Sumatera Utara" },
  { code: "13", name: "Sumatera Barat" },
  { code: "14", name: "Riau" },
  { code: "15", name: "Jambi" },
  { code: "16", name: "Sumatera Selatan" },
  { code: "17", name: "Bengkulu" },
  { code: "18", name: "Lampung" },
  { code: "19", name: "Kepulauan Bangka Belitung" },
  { code: "21", name: "Kepulauan Riau" },
  { code: "31", name: "DKI Jakarta" },
  { code: "32", name: "Jawa Barat" },
  { code: "33", name: "Jawa Tengah" },
  { code: "34", name: "DI Yogyakarta" },
  { code: "35", name: "Jawa Timur" },
  { code: "36", name: "Banten" },
];

const mockCities: RegionalItem[] = [
  { code: "3171", name: "Kota Jakarta Pusat" },
  { code: "3172", name: "Kota Jakarta Utara" },
  { code: "3173", name: "Kota Jakarta Barat" },
  { code: "3174", name: "Kota Jakarta Selatan" },
  { code: "3175", name: "Kota Jakarta Timur" },
];

export function FHIRRegionalSelectorDemo() {
  const [selectedRegion, setSelectedRegion] = useState<{ code: string; name: string } | undefined>({ code: "31", name: "DKI Jakarta" });
  const [regionType, setRegionType] = useState<"province" | "city" | "district" | "village">("province");
  const [readOnly, setReadOnly] = useState(false);

  const handleFetchData = async (query?: string): Promise<RegionalItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const data = regionType === "province" ? mockProvinces : mockCities;
    if (query) {
      return data.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.code.includes(query)
      );
    }
    return data;
  };

  const getLabel = () => {
    switch (regionType) {
      case "province": return "Provinsi";
      case "city": return "Kota/Kabupaten";
      case "district": return "Kecamatan";
      case "village": return "Kelurahan/Desa";
      default: return "Regional";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl">
      {/* Configuration Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 p-4 bg-muted/30 rounded-xl border border-border/80">
        {/* Region Type Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Region Type
          </label>
          <Select
            value={regionType}
            onValueChange={(val) => {
              setRegionType(val as any);
              setSelectedRegion(undefined);
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="province">Provinsi (Province)</SelectItem>
              <SelectItem value="city">Kota/Kabupaten (City)</SelectItem>
              <SelectItem value="district">Kecamatan (District)</SelectItem>
              <SelectItem value="village">Kelurahan/Desa (Village)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Read Only Checkbox */}
        <div className="flex items-center gap-2 sm:pr-2">
          <Checkbox
            id="regional-demo-readonly-checkbox"
            checked={readOnly}
            onCheckedChange={(checked) => setReadOnly(!!checked)}
          />
          <label
            htmlFor="regional-demo-readonly-checkbox"
            className="text-xs font-medium leading-none select-none cursor-pointer"
          >
            Read Only Mode
          </label>
        </div>
      </div>

      {/* Render Component */}
      <div className="p-6 bg-background border border-border rounded-xl flex items-center justify-center min-h-30">
        <FHIRRegionalSelector
          label={getLabel()}
          placeholder={`Cari ${getLabel().toLowerCase()}...`}
          valueCode={selectedRegion?.code}
          valueName={selectedRegion?.name}
          onChange={(code, name) => setSelectedRegion({ code, name })}
          onFetchData={handleFetchData}
          disabled={readOnly}
          className="max-w-md"
        />
      </div>

      {/* Output Payloads */}
      <div className="w-full p-4 bg-muted/40 rounded-lg overflow-auto max-h-50 border border-border">
        <div className="font-semibold text-muted-foreground mb-2 flex items-center justify-between text-xs">
          <span>onChange Output (Regional Code & Name)</span>
          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-sans">
            Indonesian Regional Code
          </span>
        </div>
        <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
          {selectedRegion
            ? JSON.stringify({ type: regionType, ...selectedRegion }, null, 2)
            : "No region selected. Choose a region above."}
        </pre>
      </div>
    </div>
  );
}
