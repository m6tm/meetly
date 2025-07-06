export type S3Bucket = {
    name: string
    creationDate: Date | undefined
}

// Type pour les objets S3
export type S3Object = {
    key: string
    size: number
    lastModified: Date | undefined
    isFolder: boolean
    type: 'file' | 'folder'
}