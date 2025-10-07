// lib/authOptions.ts
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { type AuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Account, Profile } from "next-auth";

// Minimal provider-specific profile shapes
type GoogleProfile = Profile & {
  email?: string;
  name?: string;
  picture?: string;
};

type GitHubProfile = Profile & {
  email?: string;
  name?: string;
  avatar_url?: string;
};

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
    async jwt({ token, account, profile }: { token: JWT; account?: Account | null; profile?: Profile | null }) {
      if (account && profile) {
        token.provider = account.provider;

        if (account.provider === "google") {
          const p = profile as GoogleProfile;
          if (p.email) token.email = p.email;
          if (p.name) token.name = p.name;
          if (p.picture) token.image = p.picture;
        } else if (account.provider === "github") {
          const p = profile as GitHubProfile;
          // GitHub may not return email unless scope/user settings allow it
          if (p.email) token.email = p.email;
          if (p.name) token.name = p.name;
          if (p.avatar_url) token.image = p.avatar_url;
        }
      }
      return token;
    },

    async session({ session, token }) {
      // token is JWT (augmented below)
      if (session.user) {
        session.user.email = token.email ?? session.user.email ?? null;
        session.user.name = token.name ?? session.user.name ?? null;
        session.user.image = (token.image as string | null | undefined) ?? session.user.image ?? null;
        session.user.provider = token.provider ?? null; // no 'any' needed after augmentation
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET!,
};
