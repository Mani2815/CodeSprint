import { requireParticipantSession } from '@/lib/participant-auth';
import { prisma } from '@/lib/prisma';
import { H1, Muted } from '@/components/shared/typography';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Github, Users, Calendar, Trophy, Medal } from 'lucide-react';
import { getLeaderboard } from '@/services/leaderboard-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';

export default async function TeamPage() {
  const session = await requireParticipantSession();

  const participant = await prisma.participant.findUnique({
    where: { id: session.user.participantId! },
    include: {
      team: {
        include: {
          participants: true,
          achievements: {
            orderBy: { earnedAt: 'desc' },
          },
          project: true,
        },
      },
    },
  });

  if (!participant?.teamId || !participant.team) {
    return (
      <div className="mx-auto max-w-4xl space-y-8 p-6 lg:p-8">
        <H1 className="text-3xl">Team Info</H1>
        <div className="rounded-lg border border-dashed bg-surface/30 p-8 text-center">
          <p className="font-medium">You are not assigned to a team yet.</p>
        </div>
      </div>
    );
  }

  const team = participant.team;

  // Find current standing
  const leaderboard = await getLeaderboard(ACTIVE_EVENT_SLUG);
  const rankIndex = leaderboard.findIndex((t) => t.id === team.id);
  const currentRank = rankIndex !== -1 ? rankIndex + 1 : 0;

  // Need to find who the leader is. In the current DB schema, participants are not explicitly marked as leader in the Participant model.
  // The RegistrationMember model has an `isLeader` flag. Let's try to match them up, or just assume the first participant is the leader if unknown.
  // A better way is to query the registration for this team.
  const registration = await prisma.registration.findFirst({
    where: { teamName: team.name, eventId: team.eventId },
    include: { members: true },
  });

  const leaderGithubUsername = registration?.members.find((m) => m.isLeader)?.githubUsername;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 lg:p-8">
      <div>
        <H1 className="text-3xl">Team Info</H1>
        <Muted className="mt-2">Manage your team members and view your registration details.</Muted>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-2xl">{team.name}</CardTitle>
                <CardDescription className="mt-1">
                  {team.college || 'CodeSprint Participant'}
                </CardDescription>
              </div>
              <Badge variant="success" className="text-sm">
                Approved
              </Badge>
            </CardHeader>
            <CardContent>
              <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Users className="h-4 w-4" /> Team Members
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                {team.participants.map((member) => {
                  const isLeader =
                    member.githubUsername === leaderGithubUsername ||
                    (!leaderGithubUsername && member.id === team.participants[0]?.id);

                  return (
                    <div
                      key={member.id}
                      className="flex items-start gap-4 rounded-lg border border-border/50 bg-surface/30 p-4"
                    >
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage src={member.avatarUrl ?? undefined} />
                        <AvatarFallback>
                          {member.githubUsername.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold">
                            {member.name || member.githubUsername}
                          </p>
                          {isLeader && <Crown className="h-3.5 w-3.5 shrink-0 text-warning" />}
                        </div>
                        <p className="mb-2 mt-0.5 truncate text-xs text-muted-foreground">
                          @{member.githubUsername}
                        </p>
                        <a
                          href={`https://github.com/${member.githubUsername}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                        >
                          <Github className="h-3 w-3" /> GitHub Profile
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Awards & Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {team.achievements.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {team.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-4 rounded-lg border border-border/50 bg-gradient-to-br from-primary/5 to-transparent p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <Medal className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{achievement.badgeName}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {achievement.earnedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  <Trophy className="mx-auto mb-3 h-8 w-8 opacity-30" />
                  <p className="text-sm">No awards earned yet.</p>
                  <p className="mt-1 text-xs">Keep shipping to earn badges and achievements!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registration Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {registration ? (
                <>
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Project Name</p>
                    <p className="text-sm font-medium">{registration.projectName}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Description</p>
                    <p className="line-clamp-4 text-sm">{registration.projectDescription}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Registered On</p>
                    <p className="flex items-center gap-1.5 text-sm">
                      <Calendar className="h-3.5 w-3.5" />{' '}
                      {registration.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Registration details not found.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Current Standing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-primary">
                  {currentRank > 0 ? `#${currentRank}` : '-'}
                </span>
                <span className="pb-1 text-sm text-muted-foreground">on Leaderboard</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
