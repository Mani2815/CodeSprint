'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface LeaderboardSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function LeaderboardSearch({ value, onChange }: LeaderboardSearchProps) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search teams…"
        className="pl-10"
        aria-label="Search teams by name"
      />
    </div>
  );
}
