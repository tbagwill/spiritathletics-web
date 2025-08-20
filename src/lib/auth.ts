import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export const authOptions: any = {
  providers: [
    Credentials({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null;
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!user || !user.passwordHash) return null;
          const ok = await compare(credentials.password, user.passwordHash);
          if (!ok) return null;
          if (user.role !== 'COACH' && user.role !== 'ADMIN') return null;
          return { id: user.id, name: user.name || 'Coach', email: user.email, role: user.role } as any;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: { 
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      try {
        if (user) {
          token.role = (user as any).role;
          token.id = (user as any).id;
        }
        return token;
      } catch (error) {
        console.error('JWT callback error:', error);
        return token;
      }
    },
    async session({ session, token }: { session: any; token: any }) {
      try {
        (session as any).user.role = token.role;
        (session as any).user.id = token.id || token.sub;
        return session;
      } catch (error) {
        console.error('Session callback error:', error);
        return session;
      }
    },
  },
  pages: { signIn: '/dashboard-login' },
  debug: process.env.NODE_ENV === 'development',
};
