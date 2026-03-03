import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes intelligently.
 * Combines clsx (conditional classes) with tailwind-merge (dedup utilities).
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
