import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TeamRoleDto {
  @IsString()
  name: string;
  @IsInt()
  available: number;
}

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => TeamRoleDto)
  roles: TeamRoleDto[];

  // @IsInt()
  // @Min(2)
  // total_members: number;

  @IsString({ each: true })
  tags: string[];
}
