"use client";

import * as React from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";

export interface RegionalItem {
  code: string;
  name: string;
}

export interface FHIRRegionalSelectorProps {
  label: string;
  placeholder?: string;
  valueCode?: string;
  valueName?: string;
  onChange?: (code: string, name: string) => void;
  onFetchData?: (query?: string) => Promise<RegionalItem[]>;
  disabled?: boolean;
  className?: string;
}

export function FHIRRegionalSelector({
  label,
  placeholder = "Select option...",
  valueCode = "",
  valueName = "",
  onChange,
  onFetchData,
  disabled = false,
  className,
}: FHIRRegionalSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<RegionalItem[]>([]);
  const [search, setSearch] = React.useState("");

  // Track selected item to ensure it remains in selection list and shows correct label
  const [selectedItem, setSelectedItem] = React.useState<RegionalItem | null>(null);

  // Ref to hold the debounced fetch
  const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const loadData = React.useCallback(
    async (query: string) => {
      if (!onFetchData) return;
      setLoading(true);
      try {
        const data = await onFetchData(query);
        setItems(data || []);
      } catch (err) {
        console.error(`Failed to load regional data for ${label}:`, err);
      } finally {
        setLoading(false);
      }
    },
    [onFetchData, label]
  );

  // Sync selected item from props
  React.useEffect(() => {
    if (valueCode) {
      const resolvedName = valueName || valueCode;
      setSelectedItem({ code: valueCode, name: resolvedName });
      setSearch(resolvedName);
    } else {
      setSelectedItem(null);
      setSearch("");
    }
  }, [valueCode, valueName]);

  // Load initial list on open or change in fetcher/disabled state
  React.useEffect(() => {
    if (onFetchData && !disabled) {
      loadData("");
    } else {
      setItems([]);
    }
  }, [onFetchData, disabled, loadData]);

  // Clean timeout on unmount
  React.useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);

    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(() => {
      loadData(val);
    }, 400); // 400ms debounce to avoid spamming the SATUSEHAT API
  };

  const handleValueChange = (code: string | null) => {
    if (!code) {
      if (onChange) onChange("", "");
      setSelectedItem(null);
      setSearch("");
      return;
    }

    const selected = mergedItems.find((item) => item.code === code);
    if (selected) {
      setSelectedItem(selected);
      setSearch(selected.name);
      if (onChange) onChange(selected.code, selected.name);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      // When closing, reset search text to the selected item name (or empty if none)
      setSearch(selectedItem ? selectedItem.name : "");
      // Re-load full list so that we're reset for future searches
      if (onFetchData && !disabled) {
        loadData("");
      }
    } else {
      // When opening, trigger a load of all options so the user sees everything,
      // not just the one matching the current search query
      if (onFetchData && !disabled) {
        loadData("");
      }
    }
  };

  // Merge selected item into items list if it's not already in it
  const mergedItems = React.useMemo(() => {
    if (!selectedItem) return items;
    if (items.some((item) => item.code === selectedItem.code)) return items;
    return [selectedItem, ...items];
  }, [items, selectedItem]);

  return (
    <Field className={cn(className)}>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <Combobox
          open={open}
          onOpenChange={handleOpenChange}
          value={valueCode || null}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <ComboboxInput
            placeholder={placeholder}
            className="w-full"
            value={search}
            onChange={handleInputChange}
            onFocus={(e) => e.currentTarget.select()}
            disabled={disabled}
            autoComplete="off"
          />
          <ComboboxContent className="w-full min-w-[240px]">
            <ComboboxList>
              {loading && (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
                  <Loader2Icon className="animate-spin size-4 text-primary" />
                  <span>Loading data...</span>
                </div>
              )}
              {!loading && mergedItems.map((item) => (
                <ComboboxItem key={item.code} value={item.code}>
                  <span className="font-mono text-sm text-muted-foreground mr-2">{item.code}</span>
                  <span className="font-medium text-sm">{item.name}</span>
                </ComboboxItem>
              ))}
              {!loading && mergedItems.length === 0 && (
                <ComboboxEmpty className="py-6 text-center text-sm text-muted-foreground">
                  No regional data found
                </ComboboxEmpty>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </Field>
  );
}

const defaultMockProvinces = [
  { code: "31", name: "DKI Jakarta" }
];

const defaultMockCities: Record<string, { code: string; name: string }[]> = {
  "31": [
    { code: "3174", name: "Kota Jakarta Selatan" }
  ]
};

const defaultMockDistricts: Record<string, { code: string; name: string }[]> = {
  "3174": [
    { code: "317401", name: "Kecamatan Tebet" },
    { code: "317402", name: "Kecamatan Setiabudi" }
  ]
};

const defaultMockVillages: Record<string, { code: string; name: string }[]> = {
  "317401": [
    { code: "3174011001", name: "Tebet Barat" },
    { code: "3174011002", name: "Tebet Timur" }
  ],
  "317402": [
    { code: "3174021001", name: "Kuningan Timur" },
    { code: "3174021002", name: "Karet Kuningan" }
  ]
};


export const mockFetchProvinces = async (name?: string) => {
  if (!name) return defaultMockProvinces;
  return defaultMockProvinces.filter((p) => p.name.toLowerCase().includes(name.toLowerCase()));
};

export const mockFetchCities = async (provinceCode: string, name?: string) => {
  const list = defaultMockCities[provinceCode] || [];
  if (!name) return list;
  return list.filter((c) => c.name.toLowerCase().includes(name.toLowerCase()));
};

export const mockFetchDistricts = async (cityCode: string, name?: string) => {
  const list = defaultMockDistricts[cityCode] || [];
  if (!name) return list;
  return list.filter((d) => d.name.toLowerCase().includes(name.toLowerCase()));
};

export const mockFetchVillages = async (districtCode: string, name?: string) => {
  const list = defaultMockVillages[districtCode] || [];
  if (!name) return list;
  return list.filter((v) => v.name.toLowerCase().includes(name.toLowerCase()));
};

export type RegionalSelectorLevels = 2 | 3 | 4;

export interface FHIRRegionalSelectorGroupProps {
  province?: string;
  provinceCode?: string;
  city?: string;
  cityCode?: string;
  district?: string;
  districtCode?: string;
  village?: string;
  villageCode?: string;
  /** Number of cascade levels: 2 (Province+City), 3 (+District), 4 (+Village). Default: 4 */
  levels?: RegionalSelectorLevels;
  onChange?: (values: {
    province: string;
    provinceCode: string;
    city: string;
    cityCode: string;
    district: string;
    districtCode: string;
    village: string;
    villageCode: string;
  }) => void;
  onFetchProvinces?: (name?: string) => Promise<RegionalItem[]>;
  onFetchCities?: (provinceCode: string, name?: string) => Promise<RegionalItem[]>;
  onFetchDistricts?: (cityCode: string, name?: string) => Promise<RegionalItem[]>;
  onFetchVillages?: (districtCode: string, name?: string) => Promise<RegionalItem[]>;
  disabled?: boolean;
}

export function FHIRRegionalSelectorGroup({
  province = "",
  provinceCode = "",
  city = "",
  cityCode = "",
  district = "",
  districtCode = "",
  village = "",
  villageCode = "",
  levels = 4,
  onChange,
  onFetchProvinces = mockFetchProvinces,
  onFetchCities = mockFetchCities,
  onFetchDistricts = mockFetchDistricts,
  onFetchVillages = mockFetchVillages,
  disabled = false,
}: FHIRRegionalSelectorGroupProps) {
  // Local state for names/codes to ensure responsive input updates
  const [localProvince, setLocalProvince] = React.useState(province);
  const [localProvinceCode, setLocalProvinceCode] = React.useState(provinceCode);
  const [localCity, setLocalCity] = React.useState(city);
  const [localCityCode, setLocalCityCode] = React.useState(cityCode);
  const [localDistrict, setLocalDistrict] = React.useState(district);
  const [localDistrictCode, setLocalDistrictCode] = React.useState(districtCode);
  const [localVillage, setLocalVillage] = React.useState(village);
  const [localVillageCode, setLocalVillageCode] = React.useState(villageCode);

  // Sync state with props
  React.useEffect(() => {
    setLocalProvince(province);
    setLocalProvinceCode(provinceCode);
    setLocalCity(city);
    setLocalCityCode(cityCode);
    setLocalDistrict(district);
    setLocalDistrictCode(districtCode);
    setLocalVillage(village);
    setLocalVillageCode(villageCode);
  }, [province, provinceCode, city, cityCode, district, districtCode, village, villageCode]);

  // Keep refs of callbacks and dynamic state values to prevent dependency-induced re-render loops
  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  });

  const stateRef = React.useRef({
    province: localProvince,
    provinceCode: localProvinceCode,
    city: localCity,
    cityCode: localCityCode,
    district: localDistrict,
    districtCode: localDistrictCode,
    village: localVillage,
    villageCode: localVillageCode,
  });

  React.useEffect(() => {
    stateRef.current = {
      province: localProvince,
      provinceCode: localProvinceCode,
      city: localCity,
      cityCode: localCityCode,
      district: localDistrict,
      districtCode: localDistrictCode,
      village: localVillage,
      villageCode: localVillageCode,
    };
  });

  // Load initial names of district / village if codes exist and we have fetch callbacks
  React.useEffect(() => {
    let active = true;
    if (localDistrictCode && onFetchDistricts && localCityCode && !localDistrict) {
      onFetchDistricts(localCityCode, "")
        .then((items) => {
          if (!active) return;
          const found = items.find((i) => i.code === localDistrictCode);
          if (found) {
            setLocalDistrict(found.name);
            onChangeRef.current?.({
              ...stateRef.current,
              district: found.name,
            });
          }
        })
        .catch((err) => console.error("Error resolving district name in group:", err));
    }
    return () => {
      active = false;
    };
  }, [localDistrictCode, localCityCode, onFetchDistricts, localDistrict]);

  React.useEffect(() => {
    let active = true;
    if (localVillageCode && onFetchVillages && localDistrictCode && !localVillage) {
      onFetchVillages(localDistrictCode, "")
        .then((items) => {
          if (!active) return;
          const found = items.find((i) => i.code === localVillageCode);
          if (found) {
            setLocalVillage(found.name);
            onChangeRef.current?.({
              ...stateRef.current,
              village: found.name,
            });
          }
        })
        .catch((err) => console.error("Error resolving village name in group:", err));
    }
    return () => {
      active = false;
    };
  }, [localVillageCode, localDistrictCode, onFetchVillages, localVillage]);

  const triggerChange = (updates: Partial<{
    province: string;
    provinceCode: string;
    city: string;
    cityCode: string;
    district: string;
    districtCode: string;
    village: string;
    villageCode: string;
  }>) => {
    if (!onChange) return;
    onChange({
      province: updates.hasOwnProperty("province") ? updates.province! : localProvince,
      provinceCode: updates.hasOwnProperty("provinceCode") ? updates.provinceCode! : localProvinceCode,
      city: updates.hasOwnProperty("city") ? updates.city! : localCity,
      cityCode: updates.hasOwnProperty("cityCode") ? updates.cityCode! : localCityCode,
      district: updates.hasOwnProperty("district") ? updates.district! : localDistrict,
      districtCode: updates.hasOwnProperty("districtCode") ? updates.districtCode! : localDistrictCode,
      village: updates.hasOwnProperty("village") ? updates.village! : localVillage,
      villageCode: updates.hasOwnProperty("villageCode") ? updates.villageCode! : localVillageCode,
    });
  };



  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Province Selector */}
        <FHIRRegionalSelector
          label="Province (Provinsi)"
          placeholder="Search and select province..."
          valueCode={localProvinceCode}
          valueName={localProvince}
          disabled={disabled}
          onChange={(code, name) => {
            setLocalProvince(name);
            setLocalProvinceCode(code);
            setLocalCity("");
            setLocalCityCode("");
            setLocalDistrict("");
            setLocalDistrictCode("");
            setLocalVillage("");
            setLocalVillageCode("");
            triggerChange({
              province: name,
              provinceCode: code,
              city: "",
              cityCode: "",
              district: "",
              districtCode: "",
              village: "",
              villageCode: "",
            });
          }}
          onFetchData={onFetchProvinces}
        />

        {/* City Selector */}
        <FHIRRegionalSelector
          label="City / Kabupaten (Kota/Kab)"
          placeholder={localProvinceCode ? "Search and select city/kabupaten..." : "Please select province first"}
          valueCode={localCityCode}
          valueName={localCity}
          disabled={disabled || !localProvinceCode}
          onChange={(code, name) => {
            setLocalCity(name);
            setLocalCityCode(code);
            setLocalDistrict("");
            setLocalDistrictCode("");
            setLocalVillage("");
            setLocalVillageCode("");
            triggerChange({
              city: name,
              cityCode: code,
              district: "",
              districtCode: "",
              village: "",
              villageCode: "",
            });
          }}
          onFetchData={onFetchCities ? (query) => onFetchCities(localProvinceCode, query) : undefined}
        />
      </div>

      {levels >= 3 && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* District Selector */}
          <FHIRRegionalSelector
            label="District (Kecamatan)"
            placeholder={localCityCode ? "Search and select kecamatan..." : "Please select city/kabupaten first"}
            valueCode={localDistrictCode}
            valueName={localDistrict}
            disabled={disabled || !localCityCode}
            onChange={(code, name) => {
              setLocalDistrict(name);
              setLocalDistrictCode(code);
              setLocalVillage("");
              setLocalVillageCode("");
              triggerChange({
                district: name,
                districtCode: code,
                village: "",
                villageCode: "",
              });
            }}
            onFetchData={onFetchDistricts ? (query) => onFetchDistricts(localCityCode, query) : undefined}
          />

          {/* Village Selector - only show if levels is 4 */}
          {levels >= 4 && (
            <FHIRRegionalSelector
              label="Village / Kelurahan (Desa/Kel)"
              placeholder={localDistrictCode ? "Search and select kelurahan/desa..." : "Please select kecamatan first"}
              valueCode={localVillageCode}
              valueName={localVillage}
              disabled={disabled || !localDistrictCode}
              onChange={(code, name) => {
                setLocalVillage(name);
                setLocalVillageCode(code);
                triggerChange({
                  village: name,
                  villageCode: code,
                });
              }}
              onFetchData={onFetchVillages ? (query) => onFetchVillages(localDistrictCode, query) : undefined}
            />
          )}
        </div>
      )}
    </div>
  );
}

export interface CombinedSubdistrictItem {
  code: string;
  name: string;
  fullName: string;
  districtCode: string;
  districtName: string;
  cityCode: string;
  cityName: string;
  provinceCode: string;
  provinceName: string;
}

export const defaultMockCombinedSubdistricts: CombinedSubdistrictItem[] = [
  {
    code: "3174011001",
    name: "Tebet Barat",
    fullName: "DKI Jakarta, Kota Jakarta Selatan, Kecamatan Tebet, Tebet Barat",
    districtCode: "317401",
    districtName: "Kecamatan Tebet",
    cityCode: "3174",
    cityName: "Kota Jakarta Selatan",
    provinceCode: "31",
    provinceName: "DKI Jakarta",
  },
  {
    code: "3174011002",
    name: "Tebet Timur",
    fullName: "DKI Jakarta, Kota Jakarta Selatan, Kecamatan Tebet, Tebet Timur",
    districtCode: "317401",
    districtName: "Kecamatan Tebet",
    cityCode: "3174",
    cityName: "Kota Jakarta Selatan",
    provinceCode: "31",
    provinceName: "DKI Jakarta",
  },
  {
    code: "3174021001",
    name: "Kuningan Timur",
    fullName: "DKI Jakarta, Kota Jakarta Selatan, Kecamatan Setiabudi, Kuningan Timur",
    districtCode: "317402",
    districtName: "Kecamatan Setiabudi",
    cityCode: "3174",
    cityName: "Kota Jakarta Selatan",
    provinceCode: "31",
    provinceName: "DKI Jakarta",
  },
  {
    code: "3174021002",
    name: "Karet Kuningan",
    fullName: "DKI Jakarta, Kota Jakarta Selatan, Kecamatan Setiabudi, Karet Kuningan",
    districtCode: "317402",
    districtName: "Kecamatan Setiabudi",
    cityCode: "3174",
    cityName: "Kota Jakarta Selatan",
    provinceCode: "31",
    provinceName: "DKI Jakarta",
  },
];

export const mockFetchAllSubdistricts = async (name?: string): Promise<CombinedSubdistrictItem[]> => {
  if (!name) return defaultMockCombinedSubdistricts;
  return defaultMockCombinedSubdistricts.filter((s) =>
    s.fullName.toLowerCase().includes(name.toLowerCase())
  );
};

export interface FHIRCombinedSubdistrictSelectorProps {
  label?: string;
  placeholder?: string;
  valueCode?: string;
  valueFullName?: string;
  onChange?: (item: CombinedSubdistrictItem) => void;
  onFetchData?: (query?: string) => Promise<CombinedSubdistrictItem[]>;
  disabled?: boolean;
  className?: string;
}

export function FHIRCombinedSubdistrictSelector({
  label = "Subdistrict / Village (Kelurahan)",
  placeholder = "Search subdistrict (e.g. Tebet Barat)...",
  valueCode = "",
  valueFullName = "",
  onChange,
  onFetchData = mockFetchAllSubdistricts,
  disabled = false,
  className,
}: FHIRCombinedSubdistrictSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<CombinedSubdistrictItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [selectedItem, setSelectedItem] = React.useState<CombinedSubdistrictItem | null>(null);
  const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const loadData = React.useCallback(
    async (query: string) => {
      setLoading(true);
      try {
        const data = await onFetchData(query);
        setItems(data || []);
      } catch (err) {
        console.error("Failed to load subdistrict list:", err);
      } finally {
        setLoading(false);
      }
    },
    [onFetchData]
  );

  // Sync selected item from props
  React.useEffect(() => {
    if (valueCode) {
      const resolvedName = valueFullName || valueCode;
      setSelectedItem({
        code: valueCode,
        name: "",
        fullName: resolvedName,
        districtCode: "",
        districtName: "",
        cityCode: "",
        cityName: "",
        provinceCode: "",
        provinceName: "",
      });
      setSearch(resolvedName);
    } else {
      setSelectedItem(null);
      setSearch("");
    }
  }, [valueCode, valueFullName]);

  // Load initial list
  React.useEffect(() => {
    if (!disabled) {
      loadData("");
    } else {
      setItems([]);
    }
  }, [disabled, loadData]);

  // Clean timeout on unmount
  React.useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);

    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(() => {
      loadData(val);
    }, 400);
  };

  const handleValueChange = (code: string | null) => {
    if (!code) {
      setSelectedItem(null);
      setSearch("");
      return;
    }

    const selected = mergedItems.find((item) => item.code === code);
    if (selected) {
      setSelectedItem(selected);
      setSearch(selected.fullName);
      if (onChange) onChange(selected);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch(selectedItem ? selectedItem.fullName : "");
      if (!disabled) {
        loadData("");
      }
    } else {
      if (!disabled) {
        loadData("");
      }
    }
  };

  const mergedItems = React.useMemo(() => {
    if (!selectedItem) return items;
    if (items.some((item) => item.code === selectedItem.code)) return items;
    return [selectedItem, ...items];
  }, [items, selectedItem]);

  return (
    <Field className={cn(className)}>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <Combobox
          open={open}
          onOpenChange={handleOpenChange}
          value={valueCode || null}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <ComboboxInput
            placeholder={placeholder}
            className="w-full"
            value={search}
            onChange={handleInputChange}
            onFocus={(e) => e.currentTarget.select()}
            disabled={disabled}
            autoComplete="off"
          />
          <ComboboxContent className="w-full min-w-[280px]">
            <ComboboxList>
              {loading && (
                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
                  <Loader2Icon className="animate-spin size-4 text-primary" />
                  <span>Loading data...</span>
                </div>
              )}
              {!loading && mergedItems.map((item) => (
                <ComboboxItem key={item.code} value={item.code}>
                  <div className="flex flex-col text-left py-0.5">
                    <span className="font-mono text-[10px] text-muted-foreground">{item.code}</span>
                    <span className="font-medium text-sm leading-tight">{item.fullName}</span>
                  </div>
                </ComboboxItem>
              ))}
              {!loading && mergedItems.length === 0 && (
                <ComboboxEmpty className="py-6 text-center text-sm text-muted-foreground">
                  No subdistricts found
                </ComboboxEmpty>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </Field>
  );
}
