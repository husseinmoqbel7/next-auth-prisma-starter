"use server";

import { signOut } from "@/auth";

export const logOut = async () => {
  //Add any additional logic here before logging out if needed
  await signOut();
};
