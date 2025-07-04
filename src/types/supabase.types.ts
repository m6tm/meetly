export type SupabaseConfig = {
    url: string
    anonKey: string
    serviceKey: string
    s3AccessKeyId: string
    s3SecretAccessKey: string
}

export type StorageBucket = {
    id: string
    name: string
    public: boolean
    created_at: string
    updated_at: string
    allowed_mime_types?: string[]
    file_size_limit?: number
}

export type StorageFile = {
    name: string
    id: string
    updated_at: string
    created_at: string
    last_accessed_at: string
    metadata: Record<string, any>
    buckets: StorageBucket
}

export type UploadProgress = {
    loaded: number
    total: number
    percentage: number
}

export type UploadConfig = {
    bucket: string
    filePath: string
    contentType?: string
    metadata?: Record<string, string>
    upsert?: boolean
    cacheControl?: string
    contentEncoding?: string
}

export type MultipartUploadConfig = UploadConfig & {
    partSize?: number
    queueSize?: number
    onProgress?: (progress: UploadProgress) => void
}