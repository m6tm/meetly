import { formatFileSize } from "@/lib/utils"
import { SupabaseConfig } from "@/types/supabase.types"

export const getSupabaseConfig = (): SupabaseConfig => {
    const config = {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        s3AccessKeyId: process.env.NEXT_PUBLIC_SUPABASE_S3_ACCESS_KEY_ID,
        s3SecretAccessKey: process.env.NEXT_PUBLIC_SUPABASE_S3_SECRET_ACCESS_KEY,
    }

    // Vérifier que toutes les variables sont définies
    for (const [key, value] of Object.entries(config)) {
        if (!value) {
            throw new Error(`Variable d'environnement manquante: ${key}`)
        }
    }

    return config as SupabaseConfig
}

export const generateFilePath = (
    userId: string,
    folder: string,
    fileName: string
): string => {
    const timestamp = new Date().getTime()
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    return `${userId}/${folder}/${timestamp}_${cleanFileName}`
}

export const getFileExtension = (fileName: string): string => {
    return fileName.split('.').pop()?.toLowerCase() || ''
}

export const getMimeType = (fileName: string): string => {
    const ext = getFileExtension(fileName)
    const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'pdf': 'application/pdf',
        'mp4': 'video/mp4',
        'mov': 'video/quicktime',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'txt': 'text/plain',
        'json': 'application/json',
        'zip': 'application/zip',
    }
    return mimeTypes[ext] || 'application/octet-stream'
}

export const validateFile = (
    file: File,
    maxSize: number = 50 * 1024 * 1024, // 50MB par défaut
    allowedTypes: string[] = []
): { valid: boolean; error?: string } => {
    // Vérifier la taille
    if (file.size > maxSize) {
        return {
            valid: false,
            error: `Fichier trop volumineux. Taille max: ${formatFileSize(maxSize)}`
        }
    }

    // Vérifier le type si spécifié
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`
        }
    }

    return { valid: true }
}