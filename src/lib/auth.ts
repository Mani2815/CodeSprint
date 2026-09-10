import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import { encode as defaultEncode, decode as defaultDecode } from 'next-auth/jwt';
import { verifyAdminCredentials, touchLastLogin } from '@/services/admin-service';
import { loginSchema } from '@/features/auth/validations/login-schema';
import { AUTH, ROUTES } from '@/lib/constants';
import {
  upsertParticipant,
  isParticipantAllowed,
  validateParticipantAccess,
} from '@/services/participant-service';
import { logAdminAction } from '@/services/audit-service';

/**
 * Authentication for CodeSprint is intentionally narrow:
 *  - Credentials only (username + password against the `admins` table).
 *  - No OAuth, no self-service registration, no "forgot password" flow —
 *    admin accounts are provisioned out-of-band via `scripts/create-admin.ts`.
 *  - JWT sessions (no DB session table needed for a small, trusted admin group).
 *  - "Remember me" is implemented by dynamically varying the JWT/cookie
 *    maxAge per login via custom `jwt.encode`, rather than always issuing
 *    long-lived sessions.
 */
export const authOptions: NextAuthOptions = {
  debug: true,
  session: {
    strategy: 'jwt',
    maxAge: AUTH.REMEMBER_ME_MAX_AGE_SECONDS, // ceiling; actual exp set in jwt.encode below
  },
  pages: {
    signIn: ROUTES.PARTICIPANT_LOGIN,
    error: ROUTES.PARTICIPANT_LOGIN,
  },
  providers: [
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        rememberMe: { label: 'Remember me', type: 'text' },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse({
          username: rawCredentials?.username,
          password: rawCredentials?.password,
          rememberMe: rawCredentials?.rememberMe === 'true',
        });

        if (!parsed.success) {
          // Generic message only — never reveal which field failed validation.
          throw new Error('Invalid username or password.');
        }

        const admin = await verifyAdminCredentials(parsed.data.username, parsed.data.password);
        if (!admin) {
          throw new Error('Invalid username or password.');
        }

        await touchLastLogin(admin.id);

        // Log the successful login action
        await logAdminAction(admin.id, 'LOGIN', 'Admin', admin.id);

        return {
          id: admin.id,
          username: admin.username,
          displayName: admin.displayName,
          role: 'admin' as const,
          // NextAuth's User type only requires `id`; stash rememberMe via a
          // non-standard field so the jwt() callback below can read it once.
          rememberMe: parsed.data.rememberMe,
        } as unknown as { id: string; username: string; displayName: string | null };
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login,
          displayName: profile.name ?? profile.login,
          role: 'participant' as const,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github') {
        try {
          const githubId = String(user.id);
          const githubUsername = (profile as { login?: string })?.login ?? user.name ?? user.id;

          const isAllowed = await isParticipantAllowed(githubId, githubUsername);
          if (!isAllowed) {
            return '/login?error=not_approved';
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return '/login?error=Callback';
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = user.username ?? '';
        token.displayName = user.displayName ?? user.name ?? null;
        token.rememberMe = Boolean((user as { rememberMe?: boolean }).rememberMe);
        token.role = user.role ?? 'admin';
        token.participantId = user.participantId;

        if (account?.provider === 'github' && user.role === 'participant') {
          try {
            const participant = await upsertParticipant({
              githubId: user.id,
              githubUsername: user.username ?? user.name ?? user.id,
              name: user.displayName ?? user.name,
              avatarUrl: user.image,
            });
            token.id = participant.id;
            token.participantId = participant.id;
          } catch (error: unknown) {
            console.error('Error in jwt callback during upsertParticipant:', error);
            throw new Error(
              error instanceof Error ? error.message : 'Failed to link participant profile.'
            );
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.username = token.username;
      session.user.displayName = token.displayName;
      session.user.role = token.role;
      session.user.participantId = token.participantId;

      if (token.role === 'participant' && token.participantId) {
        const isValid = await validateParticipantAccess(token.participantId as string);
        if (!isValid) {
          session.user.role = 'revoked';
        }
      }

      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.id && token?.role === 'admin') {
        // NextAuth signOut event triggers when a session is destroyed
        await logAdminAction(token.id as string, 'LOGOUT', 'Admin', token.id as string);
      }
    },
  },
  jwt: {
    // Override maxAge per-token: short session unless "remember me" was checked.
    // Note: this controls the JWT's internal `exp` claim, which NextAuth
    // validates on every request — so a non-remembered session stops being
    // accepted server-side after SESSION_MAX_AGE_SECONDS even though the
    // browser's cookie Max-Age header (set from the static session.maxAge
    // ceiling above) may still be present. That's a cosmetic-only gap (the
    // cookie is inert once the token fails validation), tracked as a
    // Phase 10 improvement if exact cookie expiry is required.
    async encode({ token, secret }) {
      const effectiveMaxAge = token?.rememberMe
        ? AUTH.REMEMBER_ME_MAX_AGE_SECONDS
        : AUTH.SESSION_MAX_AGE_SECONDS;
      return defaultEncode({ token, secret, maxAge: effectiveMaxAge });
    },
    async decode({ token, secret }) {
      return defaultDecode({ token, secret });
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
