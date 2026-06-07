"use client";

import * as React from "react";
import { type Reference } from "@medplum/fhirtypes";
import { FHIRLocationInput, type LocationItem } from "@/registry/fhir-ui/fhir-location-input";
import { mockSearchLocations, MOCK_LOCATIONS } from "@/lib/satusehat-location";

export function FHIRLocationInputDemo() {
  const [location, setLocation] = React.useState<Reference | undefined>(undefined);
  const [bed, setBed] = React.useState<Reference | undefined>(undefined);
  const [room, setRoom] = React.useState<Reference | undefined>(undefined);
  const [er, setEr] = React.useState<Reference | undefined>(undefined);

  // Handler with async search
  const handleSearch = async (
    query: string,
    filters?: {
      physicalType?: "building" | "ward" | "floor" | "room" | "bed" | "clinic" | "department" | "icu" | "er" | "or" | "pharmacy";
      organizationId?: string;
      parentLocationId?: string;
      activeOnly?: boolean;
    }
  ): Promise<LocationItem[]> => {
    return await mockSearchLocations(query, filters);
  };

  return (
    <div className="flex w-full flex-col gap-8 items-center justify-center min-h-[550px] p-4">
      <div className="grid gap-6 w-full max-w-md">
        {/* General Location Search */}
        <FHIRLocationInput
          value={location}
          onChange={setLocation}
          label="Lokasi (Semua Tipe)"
          description="Cari dan pilih lokasi fasilitas kesehatan."
          placeholder="Ketik nama lokasi..."
          onSearch={handleSearch}
        />

        {/* Bed Only */}
        <FHIRLocationInput
          value={bed}
          onChange={setBed}
          label="Tempat Tidur (Bed)"
          description="Filter khusus tempat tidur."
          placeholder="Ketik nomor bed..."
          physicalType="bed"
          onSearch={handleSearch}
        />

        {/* Room Only */}
        <FHIRLocationInput
          value={room}
          onChange={setRoom}
          label="Kamar (Room)"
          description="Filter khusus kamar perawatan."
          placeholder="Ketik nama kamar..."
          physicalType="room"
          onSearch={handleSearch}
        />

        {/* Emergency Room Only */}
        <FHIRLocationInput
          value={er}
          onChange={setEr}
          label="IGD (Emergency Room)"
          description="Filter khusus instalasi gawat darurat."
          placeholder="Ketik nama IGD..."
          physicalType="er"
          onSearch={handleSearch}
        />
      </div>

      {/* Output Display */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 w-full max-w-4xl mt-4">
        {/* Location Payload */}
        <div className="p-4 bg-muted/50 rounded-lg overflow-auto border">
          <p className="text-sm font-semibold mb-2">Location Payload:</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {location ? JSON.stringify(location, null, 2) : "No location selected"}
          </pre>
        </div>

        {/* Bed Payload */}
        <div className="p-4 bg-muted/50 rounded-lg overflow-auto border">
          <p className="text-sm font-semibold mb-2">Bed Payload:</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {bed ? JSON.stringify(bed, null, 2) : "No bed selected"}
          </pre>
        </div>

        {/* Room Payload */}
        <div className="p-4 bg-muted/50 rounded-lg overflow-auto border">
          <p className="text-sm font-semibold mb-2">Room Payload:</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {room ? JSON.stringify(room, null, 2) : "No room selected"}
          </pre>
        </div>

        {/* ER Payload */}
        <div className="p-4 bg-muted/50 rounded-lg overflow-auto border">
          <p className="text-sm font-semibold mb-2">ER Payload:</p>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {er ? JSON.stringify(er, null, 2) : "No ER selected"}
          </pre>
        </div>
      </div>

      {/* Static Options Example */}
      <div className="w-full max-w-md pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-4">
          Contoh dengan opsi statis (tanpa pencarian):
        </p>
        <FHIRLocationInput
          label="Pilih dari Daftar"
          options={MOCK_LOCATIONS.slice(0, 5)}
          onChange={(loc) => console.log("Selected:", loc)}
        />
      </div>

      {/* Parent Location Filter Example */}
      <div className="w-full max-w-md pt-4 border-t">
        <p className="text-sm text-muted-foreground mb-4">
          Filter berdasarkan lokasi induk (parent location):
        </p>
        <FHIRLocationInput
          label="Bed di ICU-01"
          placeholder="Cari bed di kamar ICU-01..."
          physicalType="bed"
          parentLocationId="loc-3"
          onSearch={handleSearch}
          onChange={(loc) => console.log("Selected bed:", loc)}
        />
      </div>
    </div>
  );
}
