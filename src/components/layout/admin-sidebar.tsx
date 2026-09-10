'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/shared/logo';
import { LogoutButton } from '@/features/auth/components/logout-button';
import { ADMIN_NAV_LINKS } from '@/components/layout/admin-nav-links';

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface sm:flex">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Logo href={false} />
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {ADMIN_NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <LogoutButton className="w-full justify-start" />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:hidden">
        <Logo href={false} imageClassName="h-7" />
        <LogoutButton />
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background/95 backdrop-blur sm:hidden">
        {ADMIN_NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <link.icon className="size-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
