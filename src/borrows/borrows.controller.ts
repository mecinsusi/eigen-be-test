import { Controller, Post, Body } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { BorrowsService } from './borrows.service';
import { BorrowDto } from './dto/borrower.dto';

@ApiTags('Borrows')
@Controller('borrows')
export class BorrowerController {
  constructor(private readonly borrowsService: BorrowsService) {}

  @Post('create')
  @ApiResponse({ status: 201, description: 'Succesfully create borrow.' })
  async borrowBook(@Body() createBorrowDto: BorrowDto) {
    return this.borrowsService.createBorrowsService(
      createBorrowDto.memberId,
      createBorrowDto.bookId,
    );
  }

  @Post('return')
  @ApiResponse({ status: 201, description: 'Succesfully return the book.' })
  async returnBook(@Body() returnDto: BorrowDto) {
    return this.borrowsService.returnBook(returnDto.memberId, returnDto.bookId);
  }
}
