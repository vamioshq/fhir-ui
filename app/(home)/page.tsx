import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">FHIR UI Registry</h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        A collection of FHIR-themed UI components built with shadcn/ui
      </p>
      <Link
        href="/docs"
        className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        View Documentation
      </Link>
    </div>
  )
}
