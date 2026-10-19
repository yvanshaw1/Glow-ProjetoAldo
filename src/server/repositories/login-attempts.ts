import "server-only";
import { getServiceClient } from "@/server/supabase/clients";

// Table login_attempts and its functions (docs/acesso/dados.md, decision
// 0047).

type LockLimits = {
  maxAttempts: number;
  lockSeconds: number;
};

// Seconds left in the lock, without counting the attempt, or null when the
// attempt was counted and the password may be checked.
export async function reserveAttempt(
  email: string,
  { maxAttempts, lockSeconds }: LockLimits,
): Promise<number | null> {
  const { data, error } = await getServiceClient().rpc(
    "reserve_login_attempt",
    {
      p_email: email,
      p_max_attempts: maxAttempts,
      p_lock_seconds: lockSeconds,
    },
  );
  if (error) {
    throw error;
  }
  const secondsLeft: unknown = data;
  return typeof secondsLeft === "number" ? secondsLeft : null;
}

export async function releaseAttempt(email: string): Promise<void> {
  const { error } = await getServiceClient().rpc("release_login_attempt", {
    p_email: email,
  });
  if (error) {
    throw error;
  }
}

export async function deleteAttempts(email: string): Promise<void> {
  const { error } = await getServiceClient()
    .from("login_attempts")
    .delete()
    .eq("email", email);
  if (error) {
    throw error;
  }
}
