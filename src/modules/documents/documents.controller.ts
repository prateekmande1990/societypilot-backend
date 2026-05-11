import { Body, Controller, Param, Post, Req } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentRequestDto } from './dto/create-document-request.dto';
import { ApproveDocumentRequestDto } from './dto/approve-document-request.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Role } from '../../common/enums/role.enum';
import { JwtPayload } from '../auth/types/jwt-payload.type';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('request')
  @Roles(
    Role.CHAIRMAN,
    Role.SECRETARY,
    Role.TREASURER,
    Role.JOINT_SECRETARY,
    Role.COMMITTEE_MEMBER,
    Role.TOWER_CAPTAIN,
    Role.OWNER_RESIDENT,
    Role.OWNER_NONRESIDENT,
    Role.TENANT,
    Role.FAMILY_MEMBER,
  )
  @Permissions('documents:request')
  requestDocument(
    @Req() req: { user: JwtPayload },
    @Body() dto: CreateDocumentRequestDto,
  ) {
    return this.documentsService.requestDocument(req.user, dto);
  }

  @Post('request/:id/approve')
  @Roles(Role.CHAIRMAN, Role.SECRETARY, Role.JOINT_SECRETARY)
  @Permissions('documents:approve')
  approveRequest(
    @Req() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body() dto: ApproveDocumentRequestDto,
  ) {
    return this.documentsService.approveRequest(req.user, id, dto);
  }
}
