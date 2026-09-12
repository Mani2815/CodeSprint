import { Metadata } from 'next';
import Link from 'next/link';
import { Github, Users, ArrowRight, Activity } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { ACTIVE_EVENT_SLUG, ROUTES } from '@/lib/constants';
import { getLeaderboardView } from '@/services/leaderboard-service';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Eyebrow, H1, Text, Muted } from '@/components/shared/typography';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RankBadge } from '@/features/leaderboard/components/rank-badge';
import { EventNotFoundError, getActiveEventId } from '@/services/event-service';
import { formatScore } from '@/utils/format';

export const metadata: Metadata = {
  title: 'Teams',
  description: 'Browse participating teams competing in the 2-week CodeSprint.',
};

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  try {
    const eventId = await getActiveEventId(ACTIVE_EVENT_SLUG);
    const view = await getLeaderboardView(ACTIVE_EVENT_SLUG);
    const rankMap = new Map(view.ranked.map((t) => [t.id, t]));

    const dbTeams = await prisma.team.findMany({
      where: { eventId },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            githubUsername: true,
            avatarUrl: true,
          },
        },
        project: true,
        submissions: {
          orderBy: { submittedAt: 'desc' },
          take: 1,
          include: {
            checkpoint: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const teamsData = dbTeams.map((team) => {
      const rankedData = rankMap.get(team.id);
      return {
        ...team,
        rank: rankedData?.rank ?? 0,
        totalScore: rankedData?.totalScore ?? 0,
      };
    });

    // Sort by rank ascending (put unranked teams at the end)
    teamsData.sort((a, b) => {
      if (a.rank === 0) return 1;
      if (b.rank === 0) return -1;
      return a.rank - b.rank;
    });

    return (
      <>
        <Navbar />
        <main className="container max-w-6xl py-10 sm:py-14">
          <div className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>CodeSprint Participants</Eyebrow>
              <H1 className="mt-2 text-3xl sm:text-4xl">Teams</H1>
              <Muted className="mt-2">
                Browse the brilliant minds competing in this year's CodeSprint event.
              </Muted>
            </div>
            <Button asChild>
              <Link href={ROUTES.REGISTER}>Register Team</Link>
            </Button>
          </div>

          <div className="pt-8">
            {teamsData.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground">
                  <Users className="size-6" />
                </div>
                <Text className="font-medium">No teams have been approved yet.</Text>
                <Muted className="mb-4 max-w-sm">
                  Be the first to join the event and showcase your skills!
                </Muted>
                <Button asChild>
                  <Link href={ROUTES.REGISTER}>Register Team</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {teamsData.map((team) => (
                  <Card
                    key={team.id}
                    className="flex h-full flex-col overflow-hidden transition-colors hover:border-primary/50"
                  >
                    <CardHeader className="pb-4">
                      <div className="mb-2 flex items-start justify-between">
                        <RankBadge rank={team.rank} />
                        <Badge variant="secondary" className="text-sm font-semibold">
                          {formatScore(team.totalScore)} pts
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{team.name}</CardTitle>
                      {team.project ? (
                        <CardDescription className="mt-1 line-clamp-2" title={team.project.name}>
                          {team.project.name}
                        </CardDescription>
                      ) : (
                        <CardDescription className="mt-1 italic text-muted-foreground/60">
                          Project details pending
                        </CardDescription>
                      )}
                    </CardHeader>

                    <CardContent className="flex-1 pb-4">
                      <div className="space-y-4">
                        {/* Members */}
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <Users className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">
                              Members ({team.participants.length})
                            </span>
                          </div>
                          <div className="flex -space-x-2">
                            {team.participants.map((member) => (
                              <Avatar
                                key={member.id}
                                className="h-8 w-8 border-2 border-background"
                                title={member.name || member.githubUsername}
                              >
                                <AvatarImage src={member.avatarUrl ?? undefined} />
                                <AvatarFallback className="text-xs">
                                  {member.githubUsername?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {team.participants.length === 0 && (
                              <span className="text-sm italic text-muted-foreground/60">
                                No members assigned
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Latest Submission Status */}
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <Activity className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">
                              Latest Progress
                            </span>
                          </div>
                          {(() => {
                            const latestSub = team.submissions[0];
                            if (!latestSub) {
                              return (
                                <span className="text-sm italic text-muted-foreground/60">
                                  No submissions yet
                                </span>
                              );
                            }
                            return (
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    latestSub.verificationStatus === 'VERIFIED'
                                      ? 'success'
                                      : latestSub.verificationStatus === 'ANALYSIS_FAILED'
                                        ? 'error'
                                        : 'warning'
                                  }
                                  className="px-1.5 py-0 text-[10px]"
                                >
                                  {latestSub.verificationStatus.replace('_', ' ')}
                                </Badge>
                                <span className="truncate text-xs text-muted-foreground">
                                  Checkpoint {latestSub.checkpoint.order}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </CardContent>

                    {team.project?.repoUrl && (
                      <CardFooter className="mt-auto flex justify-between border-t border-border/40 bg-surface/10 p-4 pt-0">
                        <a
                          href={team.project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex w-full items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
                        >
                          <Github className="size-4" />
                          Repository
                          <ArrowRight className="ml-auto size-3" />
                        </a>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  } catch (err) {
    if (err instanceof EventNotFoundError) {
      return (
        <>
          <Navbar />
          <main className="container max-w-6xl py-10 sm:py-14">
            <div className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Eyebrow>CodeSprint Participants</Eyebrow>
                <H1 className="mt-2 text-3xl sm:text-4xl">Teams</H1>
                <Muted className="mt-2">
                  Browse the brilliant minds competing in this year's CodeSprint event.
                </Muted>
              </div>
              <Button asChild>
                <Link href={ROUTES.REGISTER}>Register Team</Link>
              </Button>
            </div>

            <div className="pt-8">
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-surface text-muted-foreground">
                  <Users className="size-6" />
                </div>
                <Text className="font-medium">No teams have been approved yet.</Text>
                <Muted className="mb-4 max-w-sm">
                  Be the first to join the event and showcase your skills!
                </Muted>
                <Button asChild>
                  <Link href={ROUTES.REGISTER}>Register Team</Link>
                </Button>
              </div>
            </div>
          </main>
          <Footer />
        </>
      );
    }
    throw err;
  }
}
