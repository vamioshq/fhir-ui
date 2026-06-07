import { getPageMarkdownUrl, source } from '@/lib/source';
import { notFound } from 'next/navigation';

export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/llms.mdx/docs/[[...slug]]'>) {
  const { slug } = await params;
  const page = source.getPage((slug ?? []).slice(0, -1));
  if (!page) notFound();

  const { url } = getPageMarkdownUrl(page);
  const content = await page.data.getText('processed');

  return new Response(content, {
    headers: {
      'Content-Type': 'text/markdown',
      'Content-Disposition': `attachment; filename="${url}"`,
    },
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageMarkdownUrl(page).segments,
  }));
}
