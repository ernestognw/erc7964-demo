import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateHex(hex: string, head = 6, tail = 4) {
  if (hex.length <= head + tail + 2) return hex;
  return `${hex.slice(0, 2 + head)}…${hex.slice(-tail)}`;
}
