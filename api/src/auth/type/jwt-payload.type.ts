// import { Roles } from 'src/roles/dto/role.enum';

export interface JwtPayload {
  sub: string;
  // email: string;
  // roles: Roles[];
  // permissions: string[];
  iss: string;
  aud: string;
  iat: number;
  nbf: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string; // userId
  jti: string; // unique token id
  iss: string; // issuer
  aud: string; // audience
  iat: number; // issued at timestamp
  nbf: number; // not before timestamp
}
