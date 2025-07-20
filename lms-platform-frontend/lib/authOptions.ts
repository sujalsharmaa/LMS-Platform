// lib/authOptions.ts

import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { type AuthOptions } from "next-auth"

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile?.email) {
        token.email = profile.email;
        token.name = profile.name;
        // The type for profile.picture is string | undefined, profile.avatar_url is string.
        // The token.image is expected to be string | null | undefined.
        // It's safer to cast profile.picture to string or check its existence.
        token.image = (profile as any).picture || (profile as any).avatar_url; // Added (profile as any) for type safety if profile doesn't directly include these
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.image = token.image;
      // Add the provider to the session user object
      if (token.provider) { // Ensure provider exists on token
        (session.user as any).provider = token.provider; // Cast to any to add custom property
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30*24*60*60
  },
  secret: process.env.NEXTAUTH_SECRET!,
}

// OPTIONAL: Extend the Session and JWT types for better TypeScript support
// In a separate file (e.g., types/next-auth.d.ts) or at the top of your authOptions.ts
declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      provider?: string | null; // Add provider to the user object in the session
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    provider?: string | null; // Add provider to the JWT
  }
}