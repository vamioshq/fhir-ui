'use client';

import Link from 'next/link';

export function CustomNavbar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between gap-4 px-4 h-16 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      {/* Menu */}
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Home
        </Link>
        <Link
          href="/docs"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Docs
        </Link>
        <Link
          href="/blocks"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Blocks
        </Link>
      </div>
    </nav>
  );
}
