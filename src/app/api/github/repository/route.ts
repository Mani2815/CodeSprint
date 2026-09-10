import { NextResponse } from 'next/server';
import { parseGithubRepositoryUrl } from '@/services/github-sync-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.participantId || session.user.role === 'revoked') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repoUrl = searchParams.get('url');

    if (!repoUrl) {
      return NextResponse.json({ error: 'Missing repository URL' }, { status: 400 });
    }

    let repoRef;
    try {
      repoRef = parseGithubRepositoryUrl(repoUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid GitHub repository URL format' }, { status: 400 });
    }

    const token = process.env.GITHUB_API_TOKEN;
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'CodeSprint-Leaderboard',
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`https://api.github.com/repos/${repoRef.owner}/${repoRef.name}`, {
      headers,
      next: { revalidate: 0 },
    });

    if (response.status === 404 || response.status === 401 || response.status === 403) {
      return NextResponse.json(
        { error: 'Repository not found or is not accessible (make sure it is public).' },
        { status: 404 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `GitHub API returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.default_branch) {
      return NextResponse.json(
        { error: 'Repository is empty (no default branch).' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      isValid: true,
      name: data.name,
      owner: data.owner.login,
      language: data.language || 'Multiple / Unknown',
      updatedAt: data.pushed_at || data.updated_at,
      visibility: data.visibility || (data.private ? 'private' : 'public'),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
