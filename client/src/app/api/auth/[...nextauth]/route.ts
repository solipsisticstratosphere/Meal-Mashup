import { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { DefaultSession } from "next-auth";
import { query, CustomAdapter } from "@/lib/db-adapter";

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
          throw new Error("Please enter email and password");
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
            throw new Error("CredentialsSignin");
          }

          const user = users[0];
          console.log("User found, verifying password");

          const isPasswordValid = await compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email);
            throw new Error("CredentialsSignin");
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
          if (error instanceof Error && error.message !== "CredentialsSignin") {
            console.error("Authentication error:", error);
          }
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger, session: newClientSessionData }) {
      if (user) {
        token.id = user.id;

        token.email = user.email;
        token.picture = user.image;
        token.role = user.role;
      }
      if (trigger === "update" && newClientSessionData) {
        console.log("JWT CALLBACK: trigger === 'update'", newClientSessionData);

        if (newClientSessionData.user) {
          if (typeof newClientSessionData.user.name === "string") {
            token.name = newClientSessionData.user.name;
          }
          if (typeof newClientSessionData.user.image === "string") {
            token.picture = newClientSessionData.user.image;
          }

          // if (typeof newClientSessionData.user.role === 'string') {
          //   // @ts-ignore
          //   token.role = newClientSessionData.user.role;
          // }
        }

        // else {
        //    if (typeof newClientSessionData.name === 'string') token.name = newClientSessionData.name;
        //    if (typeof newClientSessionData.image === 'string') token.picture = newClientSessionData.image;
        // }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;

        session.user.name = token.name as string;

        session.user.email = token.email as string;

        session.user.image = token.picture as string;

        session.user.role = token.role as string;
      }

      // if (session.user && token && token.jti) { // Добавил token.jti
      //   console.log("Attempting to manage DB session for user with token:", token.email);
      //   try {
      //     const existingSessions = await query<{ id: string }>(
      //       `SELECT id FROM sessions WHERE user_id = $1 AND session_token = $2`, // Лучше также проверять session_token
      //       [token.id, token.jti]
      //     );

      //     if (existingSessions.length === 0) {
      //       console.log(
      //         "Creating new session in database for user:",
      //         token.id // Используем id, так как email может меняться
      //       );
      //       const expires = new Date();
      //       expires.setDate(expires.getDate() + 30); // 30 days

      //       await query(
      //         `INSERT INTO sessions (id, user_id, session_token, expires)
      //          VALUES ($1, $2, $3, $4)`,
      //         [uuidv4(), token.id, token.jti, expires] // Используем token.jti как session_token
      //       );
      //     }
      //   } catch (error) {
      //     console.error("Error storing session in database:", error);
      //   }
      // }
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
