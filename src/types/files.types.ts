import { getFileCategory, getMimeType, getMimeTypeFromExtension, getMimeTypeFromFilename, isFileTypeSupported } from "@/lib/files.lib";

// Types de fichiers supportés
export type FileType =
    // Documents
    | 'pdf'
    | 'doc'
    | 'docx'
    | 'xls'
    | 'xlsx'
    | 'ppt'
    | 'pptx'
    | 'txt'
    | 'rtf'
    | 'odt'
    | 'ods'
    | 'odp'

    // Images
    | 'jpg'
    | 'jpeg'
    | 'png'
    | 'gif'
    | 'bmp'
    | 'svg'
    | 'webp'
    | 'ico'
    | 'tiff'
    | 'tif'

    // Vidéos
    | 'mp4'
    | 'avi'
    | 'mov'
    | 'wmv'
    | 'flv'
    | 'webm'
    | 'mkv'
    | 'm4v'
    | '3gp'

    // Audio
    | 'mp3'
    | 'wav'
    | 'flac'
    | 'aac'
    | 'ogg'
    | 'wma'
    | 'm4a'

    // Archives
    | 'zip'
    | 'rar'
    | '7z'
    | 'tar'
    | 'gz'
    | 'bz2'

    // Code/Développement
    | 'js'
    | 'ts'
    | 'jsx'
    | 'tsx'
    | 'html'
    | 'css'
    | 'scss'
    | 'sass'
    | 'less'
    | 'json'
    | 'xml'
    | 'yaml'
    | 'yml'
    | 'md'
    | 'py'
    | 'java'
    | 'cpp'
    | 'c'
    | 'php'
    | 'rb'
    | 'go'
    | 'rs'
    | 'swift'
    | 'kt'
    | 'sql'
    | 'sh'
    | 'bat'

    // Autres
    | 'csv'
    | 'log'
    | 'ini'
    | 'cfg'
    | 'conf';

// Mapping des types de fichiers vers leurs MIME types
export const FILE_MIME_TYPES: Record<FileType, string> = {
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    rtf: 'application/rtf',
    odt: 'application/vnd.oasis.opendocument.text',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    odp: 'application/vnd.oasis.opendocument.presentation',

    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    ico: 'image/x-icon',
    tiff: 'image/tiff',
    tif: 'image/tiff',

    // Vidéos
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
    m4v: 'video/x-m4v',
    '3gp': 'video/3gpp',

    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    flac: 'audio/flac',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    wma: 'audio/x-ms-wma',
    m4a: 'audio/mp4',

    // Archives
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    bz2: 'application/x-bzip2',

    // Code/Développement
    js: 'application/javascript',
    ts: 'application/typescript',
    jsx: 'text/jsx',
    tsx: 'text/tsx',
    html: 'text/html',
    css: 'text/css',
    scss: 'text/scss',
    sass: 'text/sass',
    less: 'text/less',
    json: 'application/json',
    xml: 'application/xml',
    yaml: 'application/x-yaml',
    yml: 'application/x-yaml',
    md: 'text/markdown',
    py: 'text/x-python',
    java: 'text/x-java-source',
    cpp: 'text/x-c++src',
    c: 'text/x-csrc',
    php: 'application/x-httpd-php',
    rb: 'application/x-ruby',
    go: 'text/x-go',
    rs: 'text/rust',
    swift: 'text/x-swift',
    kt: 'text/x-kotlin',
    sql: 'application/sql',
    sh: 'application/x-sh',
    bat: 'application/x-bat',

    // Autres
    csv: 'text/csv',
    log: 'text/plain',
    ini: 'text/plain',
    cfg: 'text/plain',
    conf: 'text/plain',
};

// Exemples d'utilisation
export const USAGE_EXAMPLES = {
    // Utilisation basique
    basicUsage: () => {
        console.log(getMimeType('pdf')); // "application/pdf"
        console.log(getMimeType('jpg')); // "image/jpeg"
        console.log(getMimeType('mp4')); // "video/mp4"
    },

    // À partir d'une extension
    fromExtension: () => {
        console.log(getMimeTypeFromExtension('pdf')); // "application/pdf"
        console.log(getMimeTypeFromExtension('.jpg')); // "image/jpeg"
    },

    // À partir d'un nom de fichier
    fromFilename: () => {
        console.log(getMimeTypeFromFilename('document.pdf')); // "application/pdf"
        console.log(getMimeTypeFromFilename('image.jpg')); // "image/jpeg"
        console.log(getMimeTypeFromFilename('video.mp4')); // "video/mp4"
    },

    // Vérification de support
    checkSupport: () => {
        console.log(isFileTypeSupported('pdf')); // true
        console.log(isFileTypeSupported('unknown')); // false
    },

    // Obtenir la catégorie
    getCategory: () => {
        console.log(getFileCategory('pdf')); // "documents"
        console.log(getFileCategory('jpg')); // "images"
        console.log(getFileCategory('mp4')); // "videos"
    }
};
