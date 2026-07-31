import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAttributeValueDto {
  @IsString()
  @IsNotEmpty()
  value!: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  meta?: string; // Optional metadata (e.g., HEX color code `#FF0000`)

  @IsUUID()
  @IsNotEmpty()
  attributeId!: string;
}