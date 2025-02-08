"use server";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import { getUserByEmail } from "@/data/user";
import { db } from "@/lib/db";
import { NewPasswordSchema } from "@/lib/schemas";
import bcrypt from "bcryptjs";
import * as z from "zod";

/**
 * Updates the user's password using a provided token and new password details.
 *
 * @param values - An object containing the new password and confirm password fields,
 *                 validated against the NewPasswordSchema.
 * @param token - An optional token used to validate the password reset request.
 *
 * @returns An object with an error message if the token is missing, invalid, expired,
 *          or if the passwords do not match, or if the fields are invalid.
 *          Returns a success message if the password is updated successfully.
 */

export const newPassword = async (
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null
) => {
  if (!token) return { error: "Missing token" };
  const validatedFields = NewPasswordSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const existingToken = await getPasswordResetTokenByToken(token);

  if (!existingToken) return { error: "Invalid token" };

  const hasExpired = new Date(existingToken.expires) < new Date();

  if (hasExpired) return { error: "Token has expired!" };

  const existingUser = await getUserByEmail(existingToken.email);

  if (!existingUser) return { error: "Email does not exist!" };

  const { password, confirmPassword } = validatedFields.data;

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { id: existingUser.id },
    data: { password: hashedPassword },
  });

  await db.passwordResetToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Password updated" };
};
