import { headers } from "next/headers";
import { auth } from "./auth";

export async function getCurrentSession() {
  const reqHeaders = await headers();
  return auth.api.getSession({
    headers: reqHeaders,
  });
}

export async function getCurrentUser() {
  const sessionData = await getCurrentSession();
  return sessionData?.user ?? null;
}
