import catalog from "./conformance.json";

export type ConformanceLevel = keyof typeof catalog.levels;
export type ComponentConformance = Omit<(typeof catalog.components)[number], "levels"> & {
  levels: ConformanceLevel[];
};

export const conformanceCatalog = catalog as Omit<typeof catalog, "components"> & {
  components: ComponentConformance[];
};

export function getComponentConformance(slug: string) {
  return conformanceCatalog.components.find((component) => component.slug === slug);
}

export const conformanceCounts = conformanceCatalog.components.reduce(
  (counts, component) => {
    counts[component.maturity] = (counts[component.maturity] ?? 0) + 1;
    return counts;
  },
  {} as Record<string, number>,
);
