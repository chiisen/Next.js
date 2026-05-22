import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

export const { GET, POST } = handlers;
export { auth, signIn, signOut };