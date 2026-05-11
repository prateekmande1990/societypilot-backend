import { IsOptional, IsString } from 'class-validator';

export class CreateDocumentRequestDto {
  @IsString()
  documentType!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
