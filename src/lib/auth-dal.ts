import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";

export const getCurrentSession = cache(async () => {
  try {
    const reqHeaders = await headers();
    return await auth.api.getSession({
      headers: reqHeaders,
    });
  } catch {
    return null;
  }
});

export async function getCurrentUser() {
  const sessionData = await getCurrentSession();
  return sessionData?.user ?? null;
}
