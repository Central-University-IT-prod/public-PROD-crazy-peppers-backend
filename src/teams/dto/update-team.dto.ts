import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TeamRoleDto } from './create-team.dto';

export class UpdateTeamDto {
  @IsString()
  @IsOptional()
  name?: string;
  @IsString()
  @IsOptional()
  description?: string;
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
  @IsBoolean()
  @IsOptional()
  is_full?: boolean;
  @IsInt()
  @IsOptional()
  total_members?: number;
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => TeamRoleDto)
  roles?: TeamRoleDto[];
}
