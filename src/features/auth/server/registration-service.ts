import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export interface RegisterUserInput {
  username: string;
  password: string;
  headers?: Headers;
}

export interface RegisterUserResult {
  response?: Response;
  user?: {
    id: string;
    username: string;
    name: string;
  };
  error?: string;
  status: number;
}

export async function registerUser({
  username,
  password,
  headers,
}: RegisterUserInput): Promise<RegisterUserResult> {
  const normalizedUsername = username.toLowerCase().trim();

  // 1. Check uniqueness in database
  const existingUser = await prisma.user.findFirst({
    where: {
      username: {
        equals: normalizedUsername,
        mode: "insensitive",
      },
    },
  });

  if (existingUser) {
    return {
      error: "Username is already taken",
      status: 409,
    };
  }

  // 2. Generate internal server-only non-deliverable identity
  const internalEmail = `${normalizedUsername}@accounts.formly.invalid`;
  const defaultName = username.trim();

  // 3. Call Better Auth server API
  try {
    const authResponse = await auth.api.signUpEmail({
      body: {
        email: internalEmail,
        password,
        name: defaultName,
        username: normalizedUsername,
      },
      headers: headers,
      asResponse: true,
    });

    if (!authResponse.ok) {
      const errorBody = await authResponse.json().catch(() => ({}));
      const message = errorBody?.message || "Failed to create account";
      return {
        error: message,
        status: authResponse.status || 400,
      };
    }

    const data = await authResponse.json().catch(() => ({}));

    return {
      response: authResponse,
      user: {
        id: data?.user?.id || "",
        username: data?.user?.username || normalizedUsername,
        name: data?.user?.name || defaultName,
      },
      status: 201,
    };
  } catch (err: unknown) {
    console.error("Better Auth signup error:", err);
    return {
      error: "Failed to create account. Please try again.",
      status: 500,
    };
  }
}
