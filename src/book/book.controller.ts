import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BookService } from './book.service';

@ApiTags('Books')
@Controller('books')
export class BookController {
  constructor(private readonly bookServices: BookService) {}

  @Get()
  @ApiOperation({ summary: 'Get all the books.' })
  @ApiResponse({ status: 200, description: 'List of books.' })
  async getAllBooksController() {
    return this.bookServices.getAllBookService();
  }

  @Get('avaliable')
  @ApiOperation({ summary: 'Get all avaliable books.' })
  @ApiResponse({
    status: 200,
    description: 'List of books avaliable books with quantity.',
  })
  async getAvaliableBooksController() {
    return this.bookServices.getTheBookAvaliableService();
  }
}
