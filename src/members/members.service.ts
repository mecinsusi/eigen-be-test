import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MembersService {
  constructor(private readonly databaseService: DatabaseService) {}

  //Get member and the number of borrowed book
  async getAllMemberBorrowedBookService() {
    //Fetch data member name and the number of borowedBook
    try {
      const members = await this.databaseService.getMemberBorrowBook();
      return members;
    } catch (err) {
      console.log(`Error catching the data:`, err);
    }
  }

  // Method to actually borrow the book for the member
  async borrowBookForMemberService(
    memberId: number,
    bookId: number,
  ): Promise<void> {
    const result = await this.databaseService.inputBorrows({
      memberId,
      bookId,
      borrowedDate: new Date(),
      returnDate: null,
      status: 'PENDING',
    });
    return result;
  }
}
