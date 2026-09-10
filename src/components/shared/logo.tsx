import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

interface LogoProps {
  className?: string;
  imageClassName?: string;
  href?: string | false;
  priority?: boolean;
}

/**
 * Renders the official Labyrinth mark. Wrapped in a single component so the
 * logo asset path / aspect ratio only has to be correct in one place.
 */
export function Logo({ className, imageClassName, href = ROUTES.HOME, priority }: LogoProps) {
  const mark = (
    <div className="flex items-center gap-3">
      <Image
        src="/christ-logo.png"
        alt="Christ University"
        width={300}
        height={100}
        priority={priority}
        className={cn('h-8 w-auto object-contain', imageClassName)}
      />
      <div className="hidden h-6 w-px bg-border/60 sm:block" />
      <Image
        src="/labyrinth-logo.png"
        alt="Labyrinth Computer Science Club"
        width={520}
        height={186}
        priority={priority}
        className={cn('hidden h-8 w-auto object-contain sm:block', imageClassName)}
      />
    </div>
  );

  if (!href) {
    return <div className={className}>{mark}</div>;
  }

  return (
    <Link
      href={href}
      className={cn('inline-flex items-center transition-opacity hover:opacity-80', className)}
      aria-label="Labyrinth home"
    >
      {mark}
    </Link>
  );
}
