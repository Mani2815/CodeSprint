import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { H1, H2, H3, H4, Lead, Text, Muted, Eyebrow } from '@/components/shared/typography';
import { Logo } from '@/components/shared/logo';

const swatches = [
  { name: 'background', hex: '#0B0B0B', className: 'bg-background border border-border' },
  { name: 'surface', hex: '#151515', className: 'bg-surface' },
  { name: 'card', hex: '#1E1E1E', className: 'bg-card' },
  { name: 'border', hex: '#2C2C2C', className: 'bg-border' },
  { name: 'primary (from logo)', hex: '#CC2809', className: 'bg-primary' },
  { name: 'success', hex: '#22C55E', className: 'bg-success' },
  { name: 'warning', hex: '#F59E0B', className: 'bg-warning' },
  { name: 'error', hex: '#EF4444', className: 'bg-error' },
  { name: 'gold', hex: '#E8B923', className: 'bg-gold' },
  { name: 'silver', hex: '#C7CDD6', className: 'bg-silver' },
  { name: 'bronze', hex: '#C97A3D', className: 'bg-bronze' },
];

export default function DesignSystemPreviewPage() {
  // Internal-only reference page — never served in production.
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <main className="container max-w-5xl space-y-16 py-16">
      <section className="space-y-4">
        <Logo priority />
        <Eyebrow>Phase 2 · Design System</Eyebrow>
        <H1>Labyrinth Design System</H1>
        <Lead>Colors, typography, and the reusable component set for CodeSprint.</Lead>
      </section>

      <section className="space-y-6">
        <H2>Colors</H2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {swatches.map((s) => (
            <Card key={s.name}>
              <div className={`h-20 rounded-t-xl ${s.className}`} />
              <CardContent className="pt-4">
                <Text className="font-medium">{s.name}</Text>
                <Muted>{s.hex}</Muted>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <H2>Typography</H2>
        <div className="space-y-4">
          <H1>Heading 1 / 700</H1>
          <H2>Heading 2 / 600</H2>
          <H3>Heading 3 / 600</H3>
          <H4>Heading 4 / 500</H4>
          <Lead>Lead paragraph — used for hero subtitles and section intros.</Lead>
          <Text>Body text — used for standard paragraph copy across the site.</Text>
          <Muted>Muted / secondary text — timestamps, helper copy, captions.</Muted>
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <H2>Buttons</H2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <H2>Badges (rank indicators)</H2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="gold">Rank 1</Badge>
          <Badge variant="silver">Rank 2</Badge>
          <Badge variant="bronze">Rank 3</Badge>
          <Badge variant="success">Saved</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="secondary">Default</Badge>
        </div>
      </section>

      <Separator />

      <section className="space-y-6">
        <H2>Form elements</H2>
        <Card className="max-w-sm">
          <CardHeader>
            <CardTitle>Sample field</CardTitle>
            <CardDescription>Used by the admin login and forms.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="preview-username">Username</Label>
            <Input id="preview-username" placeholder="organizer" />
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="space-y-6">
        <H2>Table</H2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <Badge variant="gold">1</Badge>
              </TableCell>
              <TableCell>Byte Bandits</TableCell>
              <TableCell>392</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <Badge variant="secondary">2</Badge>
              </TableCell>
              <TableCell>Null Pointers</TableCell>
              <TableCell>378</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <Separator />

      <section className="space-y-6">
        <H2>Loading state</H2>
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </section>
    </main>
  );
}
