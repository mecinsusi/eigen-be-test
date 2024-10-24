import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class BookService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllBookService() {
    const books = await this.databaseService.getAllBook();
    return books;
  }

  async getTheBookAvaliableService() {
    const book = await this.databaseService.getAvaliableBook();
    return book;
  }
}
