import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import {
  ComplaintCategory,
  ComplaintPriority,
} from '@prisma/client';

export class CreateComplaintDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsEnum(ComplaintCategory)
  category!: ComplaintCategory;

  @IsOptional()
  @IsEnum(ComplaintPriority)
  priority?: ComplaintPriority;

  @IsOptional()
  @IsUUID()
  flatId?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}