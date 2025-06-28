import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateMeetToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  function randomPart(length: number): string {
    let part = ''
    for (let i = 0; i < length; i++) {
      part += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return part
  }
  return `${randomPart(6)}-${randomPart(8)}-${randomPart(10)}`
}

export function getUserNameFromEmail(email: string): string {
  return email.split('@')[0]
}

export function getUserFallBack(user_name: string): string {
  if (!user_name || user_name.trim().length === 0) return "U";
  const parts = user_name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
