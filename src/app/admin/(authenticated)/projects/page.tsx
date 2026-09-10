import { H1, Muted } from '@/components/shared/typography';
import { getActiveEventId } from '@/services/event-service';
import { listProjects } from '@/services/project-service';
import { ACTIVE_EVENT_SLUG } from '@/lib/constants';
export const dynamic = 'force-dynamic';
export default async function ProjectsPage() {
  const projects = await listProjects(await getActiveEventId(ACTIVE_EVENT_SLUG));
  return (
    <div className="space-y-8">
      <div>
        <H1 className="text-3xl">Projects</H1>
        <Muted className="mt-1">Projects and repositories linked to registered teams.</Muted>
      </div>
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-4">Project</th>
              <th className="p-4">Team</th>
              <th className="p-4">Repository</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b last:border-0">
                <td className="p-4 font-medium">{project.name}</td>
                <td className="p-4">{project.team.name}</td>
                <td className="p-4">
                  {project.repoUrl ? (
                    <a className="text-primary underline" href={project.repoUrl}>
                      Repository
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                  No projects yet. Approve a registration or create one through the API.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
