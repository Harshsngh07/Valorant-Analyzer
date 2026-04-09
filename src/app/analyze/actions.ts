"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Server Actions allow us to safely bust the cache on the server side
 * without exposing APIs or client-side caching complexity!
 */
export async function hardRefresh(name: string, tag: string) {
  // Bust the caches for this specific user
  revalidateTag(`account-${name}-${tag}`);
  revalidateTag(`matches-${name}-${tag}`);
  
  // After clearing the cache, we redirect the user to the same page
  // triggering a fresh fetch to Henriks API!
  redirect(`/analyze?name=${encodeURIComponent(name)}&tag=${encodeURIComponent(tag)}`);
}
