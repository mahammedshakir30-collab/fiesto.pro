import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No account found with this email");
        }

        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
          throw new Error(`Account locked. Try again in ${minutesLeft} minutes.`);
        }

        if (!user.password) {
          throw new Error("This account does not have a password set. Please reset your password.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          const attempts = user.failedLoginAttempts + 1;
          const updateData: any = { failedLoginAttempts: attempts };
          if (attempts >= MAX_FAILED_ATTEMPTS) {
            updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
          }
          await prisma.user.update({ where: { id: user.id }, data: updateData });

          try {
            const ip = req?.headers?.["x-forwarded-for"] || "unknown";
            await prisma.authLog.create({
              data: {
                ipAddress: typeof ip === "string" ? ip : ip[0],
                email: user.email,
                action: "LOGIN_FAIL"
              }
            });
          } catch (e) {}

          throw new Error("Incorrect password");
        }

        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null }
          });
        }

        try {
          const ip = req?.headers?.["x-forwarded-for"] || "unknown";
          await prisma.authLog.create({
            data: {
              ipAddress: typeof ip === "string" ? ip : ip[0],
              email: user.email,
              action: "LOGIN_SUCCESS"
            }
          });
        } catch (e) {}

        return {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName} ${user.lastName}`,
          role: user.role,
          securityStamp: user.securityStamp,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On initial sign-in, embed all claims into token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.securityStamp = (user as any).securityStamp;

        // Load full user data once at sign-in
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            securityStamp: true,
            emailVerified: true,
            role: true,
            userRoles: { include: { role: { include: { permissions: true } } } },
            platformUser: true,
          }
        });

        if (dbUser) {
          token.emailVerified = dbUser.emailVerified ? true : false;
          token.platformRole = dbUser.platformUser?.role;
          const festivalPermissions: Record<string, string[]> = {};
          dbUser.userRoles.forEach(ur => {
            if (!festivalPermissions[ur.festivalId]) festivalPermissions[ur.festivalId] = [];
            ur.role.permissions.forEach(p => {
              const permStr = `${p.resource}:${p.action}`;
              if (!festivalPermissions[ur.festivalId].includes(permStr)) {
                festivalPermissions[ur.festivalId].push(permStr);
              }
            });
          });
          token.festivalPermissions = festivalPermissions;
        }

        return token;
      }

      // On session update trigger, refresh from DB
      if (trigger === "update" && session) {
        token = { ...token, ...session };
        return token;
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.error === "SessionExpired") {
        return {} as any;
      }
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session.user as any).emailVerified = token.emailVerified;
        (session.user as any).festivalPermissions = token.festivalPermissions || {};
        (session.user as any).platformRole = token.platformRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_dev",
};
