import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  conformanceCatalog,
  getComponentConformance,
  type ConformanceLevel,
} from "@/lib/conformance";
import { Info } from "lucide-react";

const levelLabels: Record<ConformanceLevel, string> = {
  "fhir-shaped": "FHIR-shaped",
  "fhir-r4-validated": "FHIR R4 tested",
  "satusehat-mapped": "SATUSEHAT mapped",
  "satusehat-profile-validated": "Profile validated",
  "demo-only": "Demo / adapter",
};

export function ConformanceBadge({ level }: { level: ConformanceLevel }) {
  return <Badge variant={level === "demo-only" ? "outline" : "secondary"}>{levelLabels[level]}</Badge>;
}

export function ComponentConformanceSummary({ slug }: { slug: string }) {
  const component = getComponentConformance(slug);
  if (!component) return null;

  return (
    <Alert>
      <Info />
      <AlertTitle>Conformance status: {component.maturity}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {component.levels.map((level) => <ConformanceBadge key={level} level={level} />)}
        </div>
        <p>{component.limitations.join(" ")}</p>
        <Link className="font-medium underline underline-offset-4" href="/docs/conformance">Read the conformance policy</Link>
      </AlertDescription>
    </Alert>
  );
}

export function ConformanceMatrix() {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Component</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Maturity</TableHead>
            <TableHead>Evidence</TableHead>
            <TableHead>Known limitation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {conformanceCatalog.components.map((component) => (
            <TableRow key={component.slug}>
              <TableCell className="font-medium"><Link href={`/docs/${component.slug}`}>{component.title}</Link></TableCell>
              <TableCell><code>{component.target}</code></TableCell>
              <TableCell><Badge variant="outline">{component.maturity}</Badge></TableCell>
              <TableCell><div className="flex min-w-48 flex-wrap gap-1.5">{component.levels.map((level) => <ConformanceBadge key={level} level={level} />)}</div></TableCell>
              <TableCell className="min-w-64 text-muted-foreground">{component.limitations[0]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
