import { FILE_MIME_TYPES, FileType } from "@/types/files.types";


/**
 * Retourne le MIME type d'un type de fichier
 */
export function getMimeType(fileType: FileType): string {
    return FILE_MIME_TYPES[fileType];
}

/**
 * Retourne le MIME type à partir d'une extension de fichier
 */
export function getMimeTypeFromExtension(extension: string): string | null {
    const cleanExtension = extension.toLowerCase().replace('.', '') as FileType;
    return FILE_MIME_TYPES[cleanExtension] || null;
}

/**
 * Retourne le MIME type à partir d'un nom de fichier
 */
export function getMimeTypeFromFilename(filename: string): string | null {
    const extension = filename.split('.').pop();
    if (!extension) return null;

    return getMimeTypeFromExtension(extension);
}

/**
 * Vérifie si un type de fichier est supporté
 */
export function isFileTypeSupported(fileType: string): fileType is FileType {
    return fileType in FILE_MIME_TYPES;
}

/**
 * Retourne tous les types de fichiers supportés par catégorie
 */
export function getFileTypesByCategory() {
    return {
        documents: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp'] as FileType[],
        images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff', 'tif'] as FileType[],
        videos: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v', '3gp'] as FileType[],
        audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'] as FileType[],
        archives: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'] as FileType[],
        code: ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'sass', 'less', 'json', 'xml', 'yaml', 'yml', 'md', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'sql', 'sh', 'bat'] as FileType[],
        others: ['csv', 'log', 'ini', 'cfg', 'conf'] as FileType[]
    };
}

/**
 * Retourne la catégorie d'un type de fichier
 */
export function getFileCategory(fileType: FileType): string {
    const categories = getFileTypesByCategory();

    for (const [category, types] of Object.entries(categories)) {
        if (types.includes(fileType)) {
            return category;
        }
    }

    return 'unknown';
}

/**
 * Retourne l'icône recommandée pour un type de fichier
 */
export function getFileIcon(fileType: FileType): string {
    const category = getFileCategory(fileType);

    switch (category) {
        case 'documents':
            return '📄';
        case 'images':
            return '🖼️';
        case 'videos':
            return '🎥';
        case 'audio':
            return '🎵';
        case 'archives':
            return '📦';
        case 'code':
            return '💻';
        default:
            return '📁';
    }
}