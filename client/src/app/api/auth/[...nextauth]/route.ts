import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { DefaultSession } from "next-auth";
import { query, CustomAdapter } from "@/lib/db-adapter";
import { v4 as uuidv4 } from "uuid";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: CustomAdapter(),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          console.log("Attempting login for:", credentials.email);

          const users = await query<{
            id: string;
            email: string;
            name: string;
            password: string;
            image_url: string | null;
            role: string;
          }>(
            `SELECT id, email, name, password, image_url, role
             FROM users 
             WHERE email = $1`,
            [credentials.email]
          );

          if (!users || users.length === 0) {
            console.log("User not found:", credentials.email);
            return null;
          }

          const user = users[0];
          console.log("User found, verifying password");

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email);
            return null;
          }

          console.log("Login successful for:", credentials.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image_url || undefined,
            role: user.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        console.log("Setting session for user with token:", token.email);
        session.user.id = token.id as string;
        session.user.role = token.role as string;

        try {
          const existingSessions = await query<{ id: string }>(
            `SELECT id FROM sessions WHERE user_id = $1`,
            [token.id]
          );

          if (existingSessions.length === 0) {
            console.log(
              "Creating new session in database for user:",
              token.email
            );
            const expires = new Date();
            expires.setDate(expires.getDate() + 30); // 30 days

            await query(
              `INSERT INTO sessions (id, user_id, session_token, expires) 
               VALUES ($1, $2, $3, $4)`,
              [uuidv4(), token.id, token.jti, expires]
            );
          }
        } catch (error) {
          console.error("Error storing session in database:", error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
    newUser: "/auth/signup",
  },
  debug: process.env.NODE_ENV !== "production",
  secret: process.env.NEXTAUTH_SECRET,

  events: {
    async signOut() {
      console.log("User signed out");
    },
    async session() {
      console.log("Session accessed");
    },
    async createUser(message) {
      console.log("User created:", message.user.email);
    },
  },
};

export const runtime = "nodejs";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
