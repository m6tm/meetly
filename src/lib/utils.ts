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

/**
 * Utilitaire pour formater la taille des fichiers
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Utilitaire pour déterminer le type de fichier
 */
export function getFileType(key: string): string {
  const extension = key.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return 'video'
    case 'mp3':
    case 'wav':
    case 'flac':
      return 'audio'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return 'image'
    case 'pdf':
      return 'pdf'
    case 'json':
      return 'json'
    case 'txt':
    case 'md':
      return 'text'
    default:
      return 'unknown'
  }
}
