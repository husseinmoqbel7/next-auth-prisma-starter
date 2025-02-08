"use server";

import bcrypt from "bcryptjs";
import * as z from "zod";

import { getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsSchema } from "@/lib/schemas";

export const settings = async (values: z.infer<typeof SettingsSchema>) => {
  const validatedFields = SettingsSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const user = await currentUser();

  if (!user) {
    return { error: "User not found" };
  }

  const dbUser = await getUserById(user.id);

  if (!dbUser) {
    return { error: "User not found" };
  }

  if (user.isOAuth) {
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined;
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordMatch = await bcrypt.compare(
      values.password,
      dbUser.password
    );

    if (!passwordMatch) {
      return { error: "Current password is incorrect" };
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);

    values.password = hashedPassword;
    values.newPassword = undefined;
  }

  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      ...values,
    },
  });

  return { success: "Settings Updated!" };
};
