'use client';

import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Text, Muted } from '@/components/shared/typography';
import { LeaderboardSearch } from '@/features/leaderboard/components/leaderboard-search';
import { TeamFormDialog } from '@/features/teams/components/team-form-dialog';
import { DeleteTeamDialog } from '@/features/teams/components/delete-team-dialog';
import { matchesSearch } from '@/utils/search';
import { formatDateTime } from '@/utils/format';
import type { TeamRow } from '@/features/teams/types';

export function TeamList({ teams }: { teams: TeamRow[] }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => teams.filter((team) => matchesSearch(team.name, search)),
    [teams, search]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <LeaderboardSearch value={search} onChange={setSearch} />
        <TeamFormDialog
          mode="create"
          trigger={
            <Button>
              <Plus />
              Add Team
            </Button>
          }
        />
      </div>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground">
            <Users className="size-6" />
          </div>
          <Text className="font-medium">No teams yet</Text>
          <Muted className="max-w-sm">
            Add your first team to start entering checkpoint scores.
          </Muted>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Muted>No teams match &quot;{search}&quot;.</Muted>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium text-foreground">{team.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(new Date(team.createdAt))}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <TeamFormDialog
                      mode="edit"
                      team={team}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label={`Edit ${team.name}`}>
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                    <DeleteTeamDialog
                      team={team}
                      trigger={
                        <Button variant="ghost" size="icon" aria-label={`Delete ${team.name}`}>
                          <Trash2 className="size-4 text-error" />
                        </Button>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
