import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Design-system type scale. Rather than letting every page pick its own
 * font sizes/weights, headings and body text funnel through these so the
 * "large spacing, readable hierarchy" requirement holds everywhere.
 *
 * Weight usage:
 *  700 — H1 only (hero/page titles)
 *  600 — H2/H3 (section headers, card titles)
 *  500 — labels, emphasized inline text, nav
 *  400 — body copy
 */

export function H1({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        'text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl',
        className
      )}
      {...props}
    />
  );
}

export function H2({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        'text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl',
        className
      )}
      {...props}
    />
  );
}

export function H3({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-xl font-semibold leading-snug text-foreground sm:text-2xl', className)}
      {...props}
    />
  );
}

export function H4({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4 className={cn('text-lg font-medium leading-snug text-foreground', className)} {...props} />
  );
}

export function Lead({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-lg font-normal leading-relaxed text-muted-foreground', className)}
      {...props}
    />
  );
}

export function Text({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-base font-normal leading-relaxed text-foreground', className)}
      {...props}
    />
  );
}

export function Muted({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm font-normal text-muted-foreground', className)} {...props} />;
}

export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-primary',
        className
      )}
      {...props}
    />
  );
}
