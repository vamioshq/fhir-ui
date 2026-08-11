import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Accessibility,
  Boxes,
  FlaskConical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { conformanceCounts } from "@/lib/conformance";

const components = [
  "fhir-human-name-input",
  "fhir-address-input",
  "fhir-identifier-input",
  "fhir-contact-point-input",
  "fhir-codeable-concept-input",
  "fhir-quantity-input",
  "fhir-date-input",
  "fhir-datetime-input",
  "fhir-money-input",
  "fhir-vital-signs-input",
  "fhir-odontogram-input",
  "fhir-practitioner-input",
  "fhir-organization-input",
  "fhir-country-selector",
];

const features = [
  {
    icon: ShieldCheck,
    title: "Evidence, not slogans",
    body: "Every component publishes its target, maturity, tested behavior, integration boundary, and known limitations.",
  },
  {
    icon: Accessibility,
    title: "Accessible foundations",
    body: "Built on shadcn/ui primitives with accessibility as a design goal. Full interaction and assistive-technology coverage is tracked honestly.",
  },
  {
    icon: Boxes,
    title: "Copy, paste, own it",
    body: "shadcn-style: the components live in your codebase. Theme them, extend them, and ship them on your terms.",
  },
];

const stats = [
  { value: "26", label: "Registry items" },
  { value: String(conformanceCounts.beta ?? 0), label: "Beta components" },
  { value: "0", label: "Lock-in" },
  { value: "MIT", label: "Licensed" },
];

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden">
      {/* Ambient background — faint dotted grid + warm vignette, masked to the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px] overflow-hidden"
      >
        <div className="fd-grid absolute inset-0 text-foreground/5" />
        <div className="absolute left-1/2 top-[-18%] h-[460px] w-[min(960px,92vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,var(--accent-warm),transparent_62%)] opacity-[0.14] blur-2xl" />
      </div>

      {/* HERO */}
      <section className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-4xl flex-col items-center justify-center px-6 py-28 text-center">
        <span
          className="fd-reveal inline-flex items-center gap-2.5 rounded-full border border-border bg-background/70 px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.22em] backdrop-blur-sm"
        >
          FHIR R4 · Evidence-led registry
        </span>

        <h1
          className="fd-reveal mt-4 text-balance font-serif text-[clamp(2.6rem,7vw,5.25rem)] font-medium leading-[1.02] tracking-[-0.025em] text-foreground"
          style={{ animationDelay: "90ms" }}
        >
          Form components for
          <br />
          <span className="font-normal text-accent-warm">FHIR-native</span>{" "}
          applications.
        </h1>

        <p
          className="fd-reveal mt-8 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          style={{ animationDelay: "180ms" }}
        >
          Typed, themeable inputs with explicit evidence for FHIR behavior and
          SATUSEHAT mappings. No blanket compliance claims. {" "}
          <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.82em] text-foreground">
            @medplum/fhirtypes
          </code>{" "}
          provides the resource contracts; the conformance catalog tells you what
          is actually tested.
        </p>

        <div
          className="fd-reveal mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"
          style={{ animationDelay: "270ms" }}
        >
          <Link
            href="/docs"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 hover:shadow-lg hover:shadow-primary/10 sm:w-auto"
          >
            Browse components
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/docs/conformance"
            className="inline-flex w-full items-center justify-center rounded-full border border-border bg-background px-7 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:w-auto"
          >
            View conformance
          </Link>
        </div>

        <div
          className="fd-reveal mt-11 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/70"
          style={{ animationDelay: "360ms" }}
        >
          <span>shadcn/ui</span>
          <Sep />
          <span>Radix UI</span>
          <Sep />
          <span>FHIR R4</span>
          <Sep />
          <span>TypeScript</span>
        </div>
      </section>

      {/* STATS */}
      <section className="relative mx-auto max-w-4xl px-6 pb-4">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1.5 bg-background px-4 py-8"
            >
              <dt className="font-serif text-4xl font-medium tracking-tight text-foreground">
                {s.value}
              </dt>
              <dd className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {s.label}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="relative mx-auto max-w-4xl px-6 py-20">
        <div className="rounded-2xl border border-border bg-card p-7 sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
              <FlaskConical />
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Trust model</p>
                <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight">Know what each component guarantees.</h2>
              </div>
              <p className="max-w-2xl leading-relaxed text-muted-foreground">
                FHIR-shaped, FHIR R4 tested, SATUSEHAT mapped, and profile validated are different claims. Every registry item carries machine-readable evidence and limitations.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">FHIR-shaped</Badge>
                <Badge variant="secondary">FHIR R4 tested</Badge>
                <Badge variant="secondary">SATUSEHAT mapped</Badge>
                <Badge variant="outline">Demo / adapter</Badge>
              </div>
              <Link href="/docs/conformance" className="inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4">
                Explore the component matrix <ArrowUpRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section className="relative mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent-warm">
          A selection
        </p>
        <h2 className="mt-4 text-balance font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Built for the spec, not around it
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
          Each component maps to a FHIR datatype or resource — from a human name
          to a full odontogram.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-2.5">
          {components.map((c) => (
            <Link
              key={c}
              href={`/docs/${c}`}
              className="inline-flex items-center rounded-lg border border-border bg-background/60 px-3.5 py-2 font-mono text-[12.5px] text-muted-foreground transition-colors hover:border-accent-warm/50 hover:bg-accent hover:text-foreground"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-5 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex flex-col items-center rounded-2xl border border-border bg-card/40 p-8 text-center backdrop-blur-sm transition-colors hover:border-accent-warm/40"
            >
              <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-background text-accent-warm">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-5 font-serif text-xl font-medium text-foreground">
                {f.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CLOSING CTA */}
      <section className="relative mx-auto max-w-3xl px-6 py-28 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Get started
        </p>
        <h2 className="mt-5 text-balance font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
          Stop reinventing clinical inputs.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-pretty text-muted-foreground">
          Drop them into your app and get back to building care.
        </p>
        <Link
          href="/docs"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-medium text-primary-foreground transition-all hover:opacity-90"
        >
          Read the docs
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </section>
    </main>
  );
}

function Sep() {
  return <span aria-hidden className="text-border">·</span>;
}
