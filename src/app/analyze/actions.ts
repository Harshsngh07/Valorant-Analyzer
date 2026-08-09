"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * Server Actions allow us to safely bust the cache on the server side
 * without exposing APIs or client-side caching complexity!
 */
export async function hardRefresh(name: string, tag: string) {
  // Bust the caches globally for the analyze route so the next
  // request re-fetches fresh data from the HenrikDev API.
  revalidatePath('/analyze');
  
  // After clearing the cache, we redirect the user to the same page
  // triggering a fresh fetch to Henriks API!
  redirect(`/analyze?name=${encodeURIComponent(name)}&tag=${encodeURIComponent(tag)}`);
}
