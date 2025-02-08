import { UserRole } from "@prisma/client";
import { type DefaultSession } from "next-auth";
import "next-auth/jwt";

export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
  }
}
