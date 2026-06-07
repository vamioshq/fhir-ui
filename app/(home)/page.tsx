import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-4xl font-bold">FHIR UI Registry</h1>
      <p className="text-muted-foreground mb-8 max-w-md text-center">
        A collection of FHIR-themed UI components built with shadcn/ui
      </p>
      <Link
        href="/docs"
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-3 transition-colors"
      >
        View Documentation
      </Link>
    </div>
  )
}
