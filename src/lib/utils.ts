import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Standard utility to merge CSS classes safely when combining them.
 * This is very common in React to apply conditional classes!
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
