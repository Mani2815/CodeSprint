import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      displayName: string | null;
      role: 'admin' | 'participant' | 'revoked';
      participantId?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    username: string;
    displayName: string | null;
    role?: 'admin' | 'participant' | 'revoked';
    participantId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    displayName: string | null;
    rememberMe: boolean;
    role: 'admin' | 'participant' | 'revoked';
    participantId?: string;
  }
}
