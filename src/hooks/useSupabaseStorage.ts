import { ActionResponse } from '@/types/action-response'
import { UploadConfig, UploadProgress } from '@/types/supabase.types'
import { SupabaseUploader, UploadResult } from '@/utils/supabase/supabase_s3_upload'
import { useState, useCallback } from 'react'

export const useSupabaseStorage = () => {
    const [uploader] = useState(() => new SupabaseUploader())
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
    const [error, setError] = useState<string | null>(null)

    const uploadFile = useCallback(async (
        file: File,
        config?: UploadConfig
    ) => {
        setIsUploading(true)
        setError(null)
        setUploadProgress(null)

        if (!config) {
            config = {
                bucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_MEETINGS_BUCKET!,
                filePath: file.name,
            }
        }

        try {
            const result = await uploader.uploadWithS3Protocol(file, config)

            if (!result.success) {
                setError(result.error || 'Erreur lors de l\'upload')
                return null
            }

            return result
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue')
            return null
        } finally {
            setIsUploading(false)
        }
    }, [uploader])

    const uploadAvatar = useCallback(async (
        file: File,
        filepath: string,
    ): Promise<ActionResponse<UploadResult>> => {
        setIsUploading(true)
        setError(null)
        setUploadProgress(null)

        const config: UploadConfig = {
            bucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_AVATARS_BUCKET!,
            filePath: filepath,
            contentType: file.type
        }

        try {
            const result = await uploader.uploadAvatarWithS3Protocol(file, config)

            if (!result.success) {
                setError(result.error || 'Erreur lors de l\'upload')
                return {
                    success: false,
                    error: result.error || 'Erreur lors de l\'upload',
                    data: null
                }
            }

            return {
                success: true,
                error: null,
                data: result.data
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue')
            return {
                success: false,
                error: err instanceof Error ? err.message : 'Erreur inconnue',
                data: null
            }
        } finally {
            setIsUploading(false)
        }
    }, [uploader])

    const uploadLargeFile = useCallback(async (
        file: File,
        config?: UploadConfig
    ) => {
        setIsUploading(true)
        setError(null)
        setUploadProgress({ loaded: 0, total: file.size, percentage: 0 })

        if (!config) {
            config = {
                bucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_MEETINGS_BUCKET!,
                filePath: file.name,
            }
        }

        try {
            // Simuler le progrès (vous devrez adapter selon vos besoins)
            const result = await uploader.uploadLargeFileWithS3(file, config, (progress) => {
                if (progress.loaded && progress.total) {
                    setUploadProgress({
                        loaded: progress.loaded,
                        total: progress.total,
                        percentage: Math.round((progress.loaded / progress.total) * 100)
                    })
                }
            })

            if (!result.success) {
                setError(result.error || 'Erreur lors de l\'upload')
                return null
            }
            return result
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue')
            return null
        } finally {
            setIsUploading(false)
        }
    }, [uploader])

    const deleteFile = useCallback(async (
        bucketName: string,
        filePath: string
    ) => {
        setError(null)

        try {
            const result = await uploader.deleteFile(bucketName, filePath)

            if (!result.success) {
                setError(result.error || 'Erreur lors de la suppression')
                return false
            }

            return true
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue')
            return false
        }
    }, [uploader])

    const listFiles = useCallback(async (
        bucketName: string,
        folder?: string
    ) => {
        setError(null)

        try {
            const result = await uploader.listFiles(bucketName, folder)

            if (!result.success) {
                setError(result.error || 'Erreur lors du listage')
                return null
            }

            return result.data
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue')
            return null
        }
    }, [uploader])

    return {
        uploadFile,
        uploadAvatar,
        uploadLargeFile,
        deleteFile,
        listFiles,
        isUploading,
        uploadProgress,
        error,
        clearError: () => setError(null)
    }
}