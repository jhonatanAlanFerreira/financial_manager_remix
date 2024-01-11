import { createCookieSessionStorage } from "@remix-run/node";

export function parseJsonOrNull(data: string) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
}

export function exclude<T, Key extends keyof T>(
  model: T,
  keys: Key[]
): Omit<T, Key> {
  return Object.fromEntries(
    Object.entries(model as { [s: string]: unknown }).filter(
      ([key]) => !keys.includes(key as Key)
    )
  ) as Omit<T, Key>;
}

export async function createUserSession(userId: string) {
  const SESSION_SECRET = process.env.SESSION_SECRET;

  if (!SESSION_SECRET) {
    throw new Error("SESSION_SECRET not found");
  }

  const sessionStorage = createCookieSessionStorage({
    cookie: {
      secure: process.env.NODE_ENV === "production",
      secrets: [SESSION_SECRET],
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
    },
  });

  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  return sessionStorage.commitSession(session);
}
