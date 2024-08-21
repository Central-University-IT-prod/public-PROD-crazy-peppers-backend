import {
  IsString,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
export class RoleDto {
  @IsString()
  name: string;
  @IsInt()
  @Min(0)
  max_in_team: number;
  @IsInt()
  @Min(0)
  min_in_team: number;
}

export class CreateOlympiadDto {
  // @IsString()
  // oid: string;
  @IsString()
  name: string;
  @IsInt()
  @Min(0)
  max_participants_in_team: number;
  @IsInt()
  @Min(0)
  min_participants_in_team: number;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => RoleDto)
  roles: RoleDto[];

  @IsString({ each: true })
  tags: string[];

  @IsString()
  deadline: string;
}
