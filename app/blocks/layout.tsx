import { source } from '@/lib/blocks';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { CustomNavbar } from '@/components/custom-navbar';

export default function Layout({ children }: LayoutProps<'/blocks'>) {
  const base = baseOptions();
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...base}
      nav={{
        ...base.nav,
        component: <CustomNavbar />,
      }}
    >
      {children}
    </DocsLayout>
  );
}
