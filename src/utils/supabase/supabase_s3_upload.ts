import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { Upload, Progress } from '@aws-sdk/lib-storage'
import { createClient } from './client'

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Créer le client Supabase
const supabase = createClient()

// Configuration S3 pour Supabase
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_SUPABASE_S3_REGION!,
  endpoint: `${supabaseUrl}/storage/v1/s3`,
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
})

// Types
interface UploadOptions {
  bucket: string
  filePath: string
  contentType?: string
  metadata?: Record<string, string>
}

interface UploadResult {
  success: boolean
  data?: any
  error?: string
  publicUrl?: string
}

// Classe principale pour la gestion des uploads
export class SupabaseUploader {
  private supabase: typeof supabase
  private s3Client: S3Client

  constructor() {
    this.supabase = supabase
    this.s3Client = s3Client
  }

  // Upload avec protocole S3 (fichiers petits)
  async uploadWithS3Protocol(
    file: File | Buffer,
    options: UploadOptions
  ): Promise<UploadResult> {
    try {
      const { bucket, filePath: remotePath, contentType } = options

      // Préparer le corps du fichier pour l'environnement browser
      let body: Uint8Array | Buffer

      if (file instanceof File) {
        // Convertir le File en ArrayBuffer puis en Uint8Array pour compatibilité browser
        const arrayBuffer = await file.arrayBuffer()
        body = new Uint8Array(arrayBuffer)
      } else {
        // Si c'est déjà un Buffer, on peut l'utiliser directement
        body = Buffer.isBuffer(file) ? file : Buffer.from(file)
      }

      // Créer la commande d'upload
      const uploadCommand = new PutObjectCommand({
        Bucket: bucket,
        Key: remotePath,
        Body: body,
        ContentType: contentType || (file instanceof File ? file.type : 'application/octet-stream'),
        Metadata: options.metadata
      })

      // Exécuter l'upload
      const result = await this.s3Client.send(uploadCommand)

      // Générer l'URL publique
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${remotePath}`

      return {
        success: true,
        data: result,
        publicUrl
      }

    } catch (error) {
      return {
        success: false,
        error: `Erreur S3: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      }
    }
  }

  // Upload multipart pour gros fichiers avec S3
  async uploadLargeFileWithS3(
    file: File | Buffer,
    options: UploadOptions,
    onProgress?: (progress: Progress) => void
  ): Promise<UploadResult> {
    try {
      const { bucket, filePath: remotePath, contentType } = options

      // Préparer le corps du fichier pour l'environnement browser
      let body: Uint8Array | Buffer

      if (file instanceof File) {
        // Convertir le File en ArrayBuffer puis en Uint8Array pour compatibilité browser
        const arrayBuffer = await file.arrayBuffer()
        body = new Uint8Array(arrayBuffer)
      } else {
        // Si c'est déjà un Buffer, on peut l'utiliser directement
        body = Buffer.isBuffer(file) ? file : Buffer.from(file)
      }

      // Créer l'upload multipart
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: bucket,
          Key: remotePath,
          Body: body,
          ContentType: contentType || (file instanceof File ? file.type : 'application/octet-stream'),
          Metadata: options.metadata
        },
        partSize: 5 * 1024 * 1024, // 5MB par part
        queueSize: 4, // 4 uploads en parallèle
      })

      // Suivre le progrès (optionnel)
      if (onProgress) upload.on('httpUploadProgress', onProgress)

      // Exécuter l'upload
      const result = await upload.done()

      // Générer l'URL publique
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${remotePath}`

      return {
        success: true,
        data: result,
        publicUrl
      }

    } catch (error) {
      return {
        success: false,
        error: `Erreur upload multipart: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      }
    }
  }

  // Méthode utilitaire: Créer un bucket
  async createBucket(bucketName: string, isPublic: boolean = false): Promise<UploadResult> {
    try {
      const { data, error } = await this.supabase.storage
        .createBucket(bucketName, {
          public: isPublic,
          allowedMimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf'],
          fileSizeLimit: 50 * 1024 * 1024 * 1024 // 50GB
        })

      if (error) {
        return { success: false, error: `Erreur création bucket: ${error.message}` }
      }

      return { success: true, data }

    } catch (error) {
      return {
        success: false,
        error: `Erreur création bucket: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      }
    }
  }

  // Méthode utilitaire: Lister les fichiers
  async listFiles(bucketName: string, folder?: string): Promise<UploadResult> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .list(folder || '', {
          limit: 100,
          offset: 0
        })

      if (error) {
        return { success: false, error: `Erreur listage: ${error.message}` }
      }

      return { success: true, data }

    } catch (error) {
      return {
        success: false,
        error: `Erreur listage: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      }
    }
  }

  // Méthode utilitaire: Supprimer un fichier
  async deleteFile(bucketName: string, filePath: string): Promise<UploadResult> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .remove([filePath])

      if (error) {
        return { success: false, error: `Erreur suppression: ${error.message}` }
      }

      return { success: true, data }

    } catch (error) {
      return {
        success: false,
        error: `Erreur suppression: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      }
    }
  }

  // Méthode utilitaire: Générer une URL signée
  async createSignedUrl(
    bucketName: string,
    filePath: string,
    expiresIn: number = 3600
  ): Promise<UploadResult> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn)

      if (error) {
        return { success: false, error: `Erreur URL signée: ${error.message}` }
      }

      return { success: true, data }

    } catch (error) {
      return {
        success: false,
        error: `Erreur URL signée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      }
    }
  }
}

// Exemple d'utilisation
async function exempleUtilisation() {
  const uploader = new SupabaseUploader()

  // Créer un bucket
  const bucketResult = await uploader.createBucket('my-bucket', true)
  console.log('Création bucket:', bucketResult)

  // Upload avec S3 (depuis un Buffer)
  const imageBuffer = Buffer.from('fake-image-data', 'utf-8')
  const s3Result = await uploader.uploadWithS3Protocol(imageBuffer, {
    bucket: 'my-bucket',
    filePath: 'images/uploaded-file.jpg',
    contentType: 'image/jpeg'
  })
  console.log('Upload S3:', s3Result)

  // Upload gros fichier avec multipart (depuis un Buffer)
  const largeFileBuffer = Buffer.from('fake-large-video-data', 'utf-8')
  const largeFileResult = await uploader.uploadLargeFileWithS3(largeFileBuffer, {
    bucket: 'my-bucket',
    filePath: 'videos/large-video.mp4',
    contentType: 'video/mp4'
  })
  console.log('Upload gros fichier:', largeFileResult)

  // Lister les fichiers
  const listResult = await uploader.listFiles('my-bucket')
  console.log('Liste des fichiers:', listResult)

  // Créer une URL signée
  const signedUrlResult = await uploader.createSignedUrl('my-bucket', 'documents/test.txt', 3600)
  console.log('URL signée:', signedUrlResult)
}