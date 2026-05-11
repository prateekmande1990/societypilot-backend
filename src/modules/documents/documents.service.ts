import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentRequestDto } from './dto/create-document-request.dto';
import { ApproveDocumentRequestDto } from './dto/approve-document-request.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async requestDocument(user: JwtPayload, dto: CreateDocumentRequestDto) {
    return this.prisma.documentRequest.create({
      data: {
        societyId: user.societyId,
        userId: user.userId,
        documentType: dto.documentType,
        reason: dto.reason,
      },
    });
  }

  async approveRequest(
    approver: JwtPayload,
    requestId: string,
    dto: ApproveDocumentRequestDto,
  ) {
    const request = await this.prisma.documentRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Document request not found');

    return this.prisma.documentRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        approvedById: approver.userId,
        approvedAt: new Date(),
        fileUrl: dto.fileUrl,
      },
    });
  }
}
