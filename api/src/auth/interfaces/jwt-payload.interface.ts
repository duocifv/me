import { Roles } from 'src/roles/dto/role.enum';

// auth/interfaces/jwt-payload.interface.ts
export interface JwtPayload {
  sub: string;
  email: string;
  roles: Roles[];
  permissions: string[];
  iss: string;
  aud: string;
  iat: number;
  nbf: number;
  exp: number;
}
