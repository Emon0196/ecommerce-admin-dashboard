import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  logoId?: string;

  @IsUrl({}, { message: 'Website must be a valid URL' })
  @IsOptional()
  website?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}