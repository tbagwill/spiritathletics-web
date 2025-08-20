'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

type Props = {
  children: React.ReactNode;
  session?: any;
};

export default function SessionProvider({ children, session }: Props) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
