import { SetMetadata } from '@nestjs/common';

export const SCOPES_KEY = 'scopes';
/**
 * @Scopes('read:profile', 'write:settings', ...)
 */
export const Scopes = (...scopes: string[]) => SetMetadata(SCOPES_KEY, scopes);
