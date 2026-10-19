import "server-only";
import {
  deleteAttempts,
  releaseAttempt,
  reserveAttempt,
} from "@/server/repositories/login-attempts";
import { AppError } from "@/shared/errors/app-error";

// RS006: 5 failures in a row for the same e-mail lock the login for 15
// minutes. Rules of the lock: docs/acesso/dados.md.
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_MINUTES = 15;
const SECONDS_PER_MINUTE = 60;

// Counts the attempt before the password is checked (decision 0047). A locked
// e-mail gets ACCOUNT_LOCKED with the seconds left, even with the right
// password.
export async function reserveLoginAttempt(email: string): Promise<void> {
  const secondsLeft = await reserveAttempt(email, {
    maxAttempts: MAX_LOGIN_ATTEMPTS,
    lockSeconds: LOGIN_LOCK_MINUTES * SECONDS_PER_MINUTE,
  });
  if (secondsLeft !== null) {
    throw new AppError("ACCOUNT_LOCKED", { retryAfterSeconds: secondsLeft });
  }
}

// The password was not checked, because Supabase Auth did not answer.
export function releaseLoginAttempt(email: string): Promise<void> {
  return releaseAttempt(email);
}

// The right password resets the count, even when the account cannot sign in.
export function clearLoginAttempts(email: string): Promise<void> {
  return deleteAttempts(email);
}
