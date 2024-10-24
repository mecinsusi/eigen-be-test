import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MembersService } from './members.service';

@ApiTags('Members')
@Controller('members')
export class MembersController {
  constructor(private readonly memberService: MembersService) {}

  @Get('')
  @ApiOperation({ summary: 'Get all the members with borrowed book.' })
  @ApiResponse({ status: 200, description: 'List of members.' })
  async getAllMemberController() {
    return this.memberService.getAllMemberBorrowedBookService();
  }
}
