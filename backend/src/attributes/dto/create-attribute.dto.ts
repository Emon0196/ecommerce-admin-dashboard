import { AttributeType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateAttributeDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsEnum(AttributeType)
  type?: AttributeType = AttributeType.DROPDOWN;
}