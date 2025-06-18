export interface TokenOption {
  accessToken: {
    privateKey: string;
    expires: string;
  };
  refreshToken: {
    privateKey: string;
    expires: string;
    expiresInSeconds: number;
  };
  issuer: string;
  audience: string;
  privateKey: string;
  publicKey: string;
}
