import path from "path";

export const uploadConfig = {
     uploadDir: path.resolve(__dirname, '../../../uploads'),
    outputFormat: 'webp',
    allowedMimeTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'image/x-icon',
        'image/heic',
        'image/heif',
        'image/bmp',
        'image/avif',
    ],
    quality: {
        original: 80,
        resized: 70,
    },
    sizes: {
        thumbnail: 320,
        medium: 640,
        large: 1280,
    },
   
};
