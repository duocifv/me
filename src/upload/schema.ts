import { Type } from "@sinclair/typebox";

export const UploadRequestBody = Type.Object({
    file: Type.String({ format: 'binary' }),
});

export const SuccessResponse = Type.Object({
    message: Type.String(),
    original: Type.String(),
    thumbnail: Type.String(),
    medium: Type.String(),
    large: Type.String(),
});

export const ErrorResponse = Type.Object({
    error: Type.String(),
});
