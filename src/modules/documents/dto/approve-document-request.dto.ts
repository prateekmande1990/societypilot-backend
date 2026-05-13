import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveDocumentRequestDto {
  @ApiPropertyOptional({
    example: 'https://cdn.societypilot.in/docs/noc-2026-001.pdf',
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}
