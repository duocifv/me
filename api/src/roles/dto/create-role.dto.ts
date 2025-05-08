// create-role.dto.ts
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ArrayNotEmpty,
} from 'class-validator';
import { Roles } from './role.enum';

export class CreateRoleDto {
  @IsEnum(Roles)
  name: Roles;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  permissionIds?: string[];
}
