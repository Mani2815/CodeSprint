'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Participant } from '@prisma/client';

export function ProfileForm({ participant }: { participant: Participant }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>
          Your participant details. All fields are read-only and managed by the organizer.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="mt-2 space-y-2">
              <Label>GitHub Username</Label>
              <Input value={participant.githubUsername} disabled />
              <p className="text-[0.8rem] text-muted-foreground">Your GitHub handle (read-only).</p>
            </div>

            <div className="mt-2 space-y-2">
              <Label>Full Name</Label>
              <Input value={participant.name ?? ''} disabled />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="mt-2 space-y-2">
              <Label>Class</Label>
              <Input value={participant.className ?? ''} disabled />
            </div>

            <div className="mt-2 space-y-2">
              <Label>Registration Number</Label>
              <Input value={participant.regNo ?? ''} disabled />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
