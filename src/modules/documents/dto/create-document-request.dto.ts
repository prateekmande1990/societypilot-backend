import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentRequestDto {
  @ApiProperty({ example: 'NOC_BANK_LOAN' })
  @IsString()
  documentType!: string;

  @ApiPropertyOptional({ example: 'Required for home loan processing' })
  @IsOptional()
  @IsString()
  reason?: string;
}
