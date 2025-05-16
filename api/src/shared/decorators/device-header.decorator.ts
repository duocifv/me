import { applyDecorators } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

/**
 * Adds the `x-device-id` header to Swagger documentation.
 *
 * This header is used to uniquely identify the client's device (e.g., browser, mobile app).
 * It is required for authentication-related endpoints like login, refresh token, and logout.
 *
 * The server uses this identifier to bind access and refresh tokens to a specific device fingerprint.
 * This improves session security by preventing token reuse across multiple devices.
 *
 * Example value: `123e4567-e89b-12d3-a456-426614174000`
 */
export function DeviceHeader() {
  return applyDecorators(
    ApiHeader({
      name: 'X-Device-Fingerprint',
      description: `A unique identifier representing the client's device.
It is used to bind the authentication session (e.g., access/refresh tokens) to a specific device.
Required for enhanced security during login, token refresh, and logout operations.`,
      required: true,
      schema: {
        type: 'string',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    }),
  );
}
