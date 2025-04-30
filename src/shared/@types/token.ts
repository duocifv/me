export interface TokenOption {
  accessToken: {
    secret: string;
    expires: string;
  };
  refreshToken: {
    secret: string;
    expires: string;
  };
  issuer: string;
  audience: string;
  privateKey: string;
  publicKey: string;
}
