import { IsOptional, IsString } from 'class-validator';

export class ApproveDocumentRequestDto {
  @IsOptional()
  @IsString()
  fileUrl?: string;
}
