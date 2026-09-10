import { Logo } from '@/components/shared/logo';
import { Muted } from '@/components/shared/typography';
import { ORG_NAME } from '@/lib/constants';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="container flex flex-col items-center gap-4 py-10 sm:flex-row sm:justify-between">
        <Logo imageClassName="h-6" />
        <Muted className="text-center sm:text-right">
          © {year} {ORG_NAME}.
        </Muted>
      </div>
    </footer>
  );
}
