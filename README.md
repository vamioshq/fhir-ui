# FHIR UI Components Registry

Premium, strictly-typed React component library designed for healthcare. Built on the shadcn/ui architecture, Tailwind CSS v4, and Medplum FHIR types, providing the building blocks for creating modern, accessible, and compliant healthcare applications.

Specialized integration presets are provided for the Indonesian Ministry of Health (**Kemenkes SATUSEHAT**) platform.

---

## 🚀 Key Features

* **Strictly Typed**: Full TypeScript support using native `@medplum/fhirtypes` definitions.
* **Tailwind CSS v4**: Built on the latest Tailwind framework with modern design primitives.
* **SATUSEHAT Ready**: Includes validation presets and mapping structures for Indonesian healthcare standards (gender, religion, marital status, citizenship, and administrative divisions).
* **Interactive SVG Odontogram**: Complete interactive dental chart (Rekam Medis Gigi) mapping to FHIR `Observation` arrays.
* **Component Registry**: Serve components directly via `shadcn` CLI without bulky npm package dependencies.

---

## 🛠️ Getting Started

### 1. Build and Run Registry Locally
```bash
# Install dependencies
pnpm install

# Run development server with docs
pnpm dev

# Build the registry components statically
pnpm registry:build
```

### 2. Configure Shadcn UI in Your Client App
Ensure your target React project is set up with shadcn/ui:
```bash
npx shadcn@latest init
```

### 3. Install Medplum FHIR Types
The registry components rely on strict type contracts from Medplum:
```bash
npm install @medplum/fhirtypes
```

### 4. Fetch and Inject Components
Add components directly using the `shadcn` CLI:
```bash
npx shadcn@latest add https://<your-registry-url>/r/<component-name>.json
```
*(Note: Replace `<your-registry-url>` with the actual deployment URL of this registry once published, or `http://localhost:3000` during local testing).*

---

## 📂 Project Architecture

```
├── app/                  # Next.js app pages and layouts
├── components/           # Documentation-specific layout components and previews
├── content/              # MDX files and navigation structure for Fumadocs
├── registry/             # Source code of the FHIR components
│   └── fhir-ui/          # 26 components (Address, Vital Signs, Odontogram, etc.)
├── registry.json         # Shadcn registry manifests and metadata
└── source.config.ts      # Fumadocs content collection config
```

Jah bless clean healthcare interfaces! 🇯🇲✨
