import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCurrentSession } from "@/lib/auth-dal";
import { deleteAccountSchema, DeleteAccountInput } from "../schemas/profile-schema";

export async function deleteCurrentAccount(
  input: DeleteAccountInput
): Promise<{ success: boolean; error?: string }> {
  const sessionData = await getCurrentSession();
  if (!sessionData?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = deleteAccountSchema.safeParse(input);
  if (!parsed.success) {
    const errorMsg = parsed.error.errors[0]?.message || "Invalid deletion request";
    return { success: false, error: errorMsg };
  }

  if (parsed.data.confirmation !== "DELETE") {
    return { success: false, error: "Please type DELETE to confirm" };
  }

  try {
    const reqHeaders = await headers();
    
    // Call Better Auth's deleteUser endpoint with the provided password for re-authentication
    const response = await auth.api.deleteUser({
      body: {
        password: parsed.data.password,
      },
      headers: reqHeaders,
    });

    if (response && (response as any).success) {
      return { success: true };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Account deletion error:", error);
    const message =
      error?.body?.message ||
      error?.message ||
      "Failed to delete account. Please verify your password and try again.";
    
    if (message.includes("INVALID_PASSWORD") || message.toLowerCase().includes("password")) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    return {
      success: false,
      error: "Unable to delete account at this time. Please try again later.",
    };
  }
}
