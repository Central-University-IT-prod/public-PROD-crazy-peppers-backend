import { IsBoolean, IsOptional, IsString } from "class-validator";

// enum Sex {
//   male = 'm',
//   female = 'f',
//   notStated = 'ns',
// }

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  telegram?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  tid?: string | null;

  @IsBoolean()
  @IsOptional()
  is_captain?: boolean;
}
