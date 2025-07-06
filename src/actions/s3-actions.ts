'use server'

import { S3Bucket, S3Object } from '@/types/s3.types';
import { S3Client, ListBucketsCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Configuration du client S3
const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION || 'us-east-2',
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY!,
    },
})


/**
 * Action pour lister tous les buckets
 */
export async function listBuckets(): Promise<{ success: boolean; buckets?: S3Bucket[]; error?: string }> {
    try {
        const command = new ListBucketsCommand({})
        const response = await s3Client.send(command)

        const buckets: S3Bucket[] = response.Buckets?.map(bucket => ({
            name: bucket.Name || '',
            creationDate: bucket.CreationDate,
        })) || []

        return { success: true, buckets }
    } catch (error) {
        console.error('Erreur lors de la liste des buckets:', error)
        return { success: false, error: 'Impossible de récupérer les buckets' }
    }
}

/**
 * Action pour lister le contenu d'un bucket (avec support des dossiers)
 */
export async function listBucketContents(
    bucketName: string,
    prefix: string = ''
): Promise<{ success: boolean; objects?: S3Object[]; error?: string }> {
    try {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix,
            Delimiter: '/', // Pour traiter les dossiers
        })

        const response = await s3Client.send(command)

        const objects: S3Object[] = []

        // Ajouter les dossiers (CommonPrefixes)
        response.CommonPrefixes?.forEach(commonPrefix => {
            if (commonPrefix.Prefix && commonPrefix.Prefix !== prefix) {
                objects.push({
                    key: commonPrefix.Prefix,
                    size: 0,
                    lastModified: undefined,
                    isFolder: true,
                    type: 'folder'
                })
            }
        })

        // Ajouter les fichiers
        response.Contents?.forEach(content => {
            if (content.Key && content.Key !== prefix) {
                objects.push({
                    key: content.Key,
                    size: content.Size || 0,
                    lastModified: content.LastModified,
                    isFolder: false,
                    type: 'file'
                })
            }
        })

        return { success: true, objects }
    } catch (error) {
        console.error('Erreur lors de la liste du contenu:', error)
        return { success: false, error: 'Impossible de récupérer le contenu du bucket' }
    }
}

/**
 * Action pour générer une URL de téléchargement signée
 */
export async function generateDownloadUrl(
    bucketName: string,
    objectKey: string,
    expiresIn: number = 3600 // 1 heure par défaut
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        })

        const url = await getSignedUrl(s3Client, command, { expiresIn })

        return { success: true, url }
    } catch (error) {
        console.error('Erreur lors de la génération de l\'URL:', error)
        return { success: false, error: 'Impossible de générer l\'URL de téléchargement' }
    }
}

/**
 * Action pour télécharger un fichier directement (pour les petits fichiers)
 */
export async function downloadFile(
    bucketName: string,
    objectKey: string
): Promise<{ success: boolean; data?: Buffer; contentType?: string; error?: string }> {
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        })

        const response = await s3Client.send(command)

        if (!response.Body) {
            return { success: false, error: 'Fichier vide ou introuvable' }
        }

        // Convertir le stream en buffer
        const chunks: Uint8Array[] = []
        const reader = response.Body.transformToWebStream().getReader()

        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value)
        }

        const buffer = Buffer.concat(chunks)

        return {
            success: true,
            data: buffer,
            contentType: response.ContentType || 'application/octet-stream'
        }
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error)
        return { success: false, error: 'Impossible de télécharger le fichier' }
    }
}

/**
 * Action pour obtenir les métadonnées d'un fichier
 */
export async function getFileMetadata(
    bucketName: string,
    objectKey: string
): Promise<{ success: boolean; metadata?: any; error?: string }> {
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
        })

        const response = await s3Client.send(command)

        const metadata = {
            contentType: response.ContentType,
            contentLength: response.ContentLength,
            lastModified: response.LastModified,
            etag: response.ETag,
            metadata: response.Metadata,
        }

        return { success: true, metadata }
    } catch (error) {
        console.error('Erreur lors de la récupération des métadonnées:', error)
        return { success: false, error: 'Impossible de récupérer les métadonnées' }
    }
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