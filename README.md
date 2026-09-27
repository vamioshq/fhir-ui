# FHIR UI

Open-source React building blocks for FHIR R4 forms, distributed through a shadcn registry with first-class SATUSEHAT mappings.

FHIR UI distinguishes between FHIR-compatible TypeScript structures, tested conversion logic, SATUSEHAT mappings, and full profile validation. See the [conformance catalog](./lib/conformance.json) before using a component in production.

## Quick start

From a shadcn-enabled React project that uses a **Base UI** style (for example `base-mira`; fhir-ui is built and tested on `base-mira`). Releases up to v0.1.0 targeted Radix styles (`radix-mira`):

```bash
pnpm dlx shadcn@latest add https://raw.githubusercontent.com/vamioshq/fhir-ui/main/public/r/fhir-date-input.json
```

The registry installs the component source, required shadcn primitives, helper files, and npm dependencies into your application.

### Pinning a release

Items on `main` point their dependencies at `main`. Each release tag is built so that its items, and every fhir-ui item they depend on, point at that tag. For reproducible installs, register the tag as a named registry in your `components.json`:

```json
{
  "registries": {
    "@fhir-ui": "https://raw.githubusercontent.com/vamioshq/fhir-ui/v0.1.0/public/r/{name}.json"
  }
}
```

```bash
pnpm dlx shadcn@latest add @fhir-ui/fhir-date-input
```

To upgrade, change the tag and reinstall. Treat installed files as vendored source: fix problems here and release, rather than editing them in your application.

```tsx
import { FHIRDateInput } from "@/registry/fhir-ui/fhir-date-input"

<FHIRDateInput
  value={patient.birthDate}
  onChange={(birthDate) => setPatient({ ...patient, birthDate })}
  showLabel
  label="Date of birth"
/>
```

## Evidence levels

| Label | Meaning |
| --- | --- |
| FHIR-shaped | Uses FHIR R4-compatible structures; profile validity is not implied. |
| FHIR R4 tested | Documented conversion constraints have automated tests. |
| SATUSEHAT mapped | Includes documented Indonesian codes, systems, or extensions. |
| Profile validated | Tested against a named and versioned StructureDefinition. No component currently carries this label. |
| Demo / adapter | Includes mock data or requires a consumer-supplied integration. |

The machine-readable catalog records every component’s target, maturity, evidence, terminology, tests, integration boundary, and known limitations.

## Development

```bash
pnpm install
pnpm dev
pnpm test
pnpm lint
pnpm types:check
pnpm registry:sync
pnpm registry:build
pnpm registry:audit
pnpm artifacts:check
pnpm test:clean-install
pnpm test:e2e
```

To release, bump `version` in `package.json` in a normal commit, then run `pnpm registry:release <version>` on that commit and push the tag it prints. The script commits the tag-pinned registry on a detached HEAD and tags it, so the branch keeps pointing at `main`.

Pull requests run the same quality gate on GitHub Actions. The clean-install check creates an isolated `src`-based consumer, installs all registry items through the shadcn CLI, verifies their target files, and type-checks the installed source.

`REGISTRY_BASE_URL` can override the default GitHub-hosted dependency origin during registry builds.

## Production responsibilities

FHIR UI is a data-entry toolkit, not a terminology server, identity service, profile validator, or clinical decision-support system. Consuming applications remain responsible for final resource validation, authentication, authorization, consent, audit logging, terminology validation, and clinical governance.
