import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateVariantItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  barcode?: string;
}

export class BulkUpdateVariantsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateVariantItemDto)
  variants: UpdateVariantItemDto[];
}