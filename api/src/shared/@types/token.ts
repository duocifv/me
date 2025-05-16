export interface TokenOption {
  accessToken: {
    privateKey: string;
    expires: string;
  };
  refreshToken: {
    privateKey: string;
    expires: string;
  };
  issuer: string;
  audience: string;
  privateKey: string;
  publicKey: string;
}
