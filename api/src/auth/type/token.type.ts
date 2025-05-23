export interface Token {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  userId: string;
}
