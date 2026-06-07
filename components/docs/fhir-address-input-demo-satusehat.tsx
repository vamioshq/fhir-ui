"use client";

import * as React from "react";
import { FHIRAddressInput } from "@/registry/fhir-ui/fhir-address-input";

export function FHIRAddressInputDemoSatusehat() {
  return (
    <FHIRAddressInput 
      variant="detailed"
      onFetchProvinces={async (name) => {
        const provinces = [
          { code: "11", name: "Aceh" },
          { code: "12", name: "Sumatera Utara" },
          { code: "31", name: "DKI Jakarta" },
          { code: "32", name: "Jawa Barat" },
          { code: "33", name: "Jawa Tengah" },
          { code: "35", name: "Jawa Timur" }
        ];
        if (!name) return provinces;
        return provinces.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
      }}
      onFetchCities={async (provinceCode, name) => {
        const cities: Record<string, { code: string; name: string }[]> = {
          "31": [
            { code: "3171", name: "Kota Jakarta Pusat" },
            { code: "3173", name: "Kota Jakarta Barat" }
          ],
          "32": [
            { code: "3273", name: "Kota Bandung" },
            { code: "3204", name: "Kab. Bandung" }
          ],
          "33": [
            { code: "3374", name: "Kota Semarang" },
            { code: "3322", name: "Kab. Semarang" }
          ]
        };
        const list = cities[provinceCode] || [];
        if (!name) return list;
        return list.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));
      }}
      onFetchDistricts={async (cityCode, name) => {
        const districts: Record<string, { code: string; name: string }[]> = {
          "3171": [
            { code: "317101", name: "Menteng" },
            { code: "317102", name: "Tanah Abang" }
          ],
          "3273": [
            { code: "327301", name: "Coblong" },
            { code: "327302", name: "Lengkong" }
          ],
          "3374": [
            { code: "337411", name: "Pedurungan" },
            { code: "337412", name: "Semarang Selatan" }
          ]
        };
        const list = districts[cityCode] || [];
        if (!name) return list;
        return list.filter(d => d.name.toLowerCase().includes(name.toLowerCase()));
      }}
      onFetchVillages={async (districtCode, name) => {
        const villages: Record<string, { code: string; name: string }[]> = {
          "317101": [
            { code: "3171011001", name: "Menteng" },
            { code: "3171011002", name: "Pegangsaan" }
          ],
          "327301": [
            { code: "3273011001", name: "Dago" },
            { code: "3273011002", name: "Lebak Siliwangi" }
          ],
          "337411": [
            { code: "3374111001", name: "Pedurungan Kidul" },
            { code: "3374111002", name: "Pedurungan Lor" }
          ]
        };
        const list = villages[districtCode] || [];
        if (!name) return list;
        return list.filter(v => v.name.toLowerCase().includes(name.toLowerCase()));
      }}
    />
  );
}
