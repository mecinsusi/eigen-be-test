import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MembersService } from '../members/members.service';

@Injectable()
export class BorrowsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly memberService: MembersService,
  ) {}

  //Create borrow book for member
  async createBorrowsService(memberId: number, bookId: number) {
    try {
      //1. Check, if the member are penalized?
      const isPenalizedMember =
        await this.databaseService.isPenalizedMember(memberId);
      console.log(`Penalized member?`, isPenalizedMember);
      // 2. if member are penalized, check has the penalty period passed? (3 days after return)
      if (isPenalizedMember === true) {
        // 2.1 Get the end date of penalty period
        const penaltyEndDate =
          await this.databaseService.getPenaltyEndDate(memberId);
        console.log(`Penalty end date:`, penaltyEndDate);
        // 2.2 Check, if the member has passed the penalty period, update the ispenalized to false
        if (new Date() > penaltyEndDate) {
          await this.databaseService.updateClearPenalized(memberId);
        } else {
          throw new BadRequestException(
            'Member is currently penalized and cannot borrow books.',
          );
        }
      }

      // 3. Check if member may not borrow more than 2 books
      const borrowedBooksCount =
        await this.databaseService.getBorrowedBooksCount(memberId);
      console.log(`Amount of borrowed book:`, borrowedBooksCount);
      if (borrowedBooksCount >= 2) {
        throw new BadRequestException(
          'Member cannot borrow more than 2 books.',
        );
      }

      // 4. Check if the book is already borrowed by another member (avaliable book)
      const isBookAvaliable =
        await this.databaseService.isBookAvaliable(bookId);
      console.log(`Avaliable book?`, isBookAvaliable);
      if (!isBookAvaliable) {
        throw new BadRequestException(
          'Book is already borrowed by another member.',
        );
      }
      // 5. If all checks are passed, proceed to allow the member to borrow the book
      await this.memberService.borrowBookForMemberService(memberId, bookId);
      return { message: 'Book borrowed successfully.' };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  //Returning book from member
  async returnBook(memberId: number, bookId: number) {
    try {
      //1. Check, if the book was actually borrowed by member
      const isBookBorrowed = await this.databaseService.isBookBorrowedByMember(
        memberId,
        bookId,
      );
      console.log(
        `It is true that this book borrowed by member?`,
        isBookBorrowed,
      );
      if (!isBookBorrowed) {
        throw new BadRequestException(
          'The book is not borrowed by the member.',
        );
      }

      // 2. Check, whether the book was retured more than 7 days
      const borrows = await this.databaseService.getAllBorrows(
        memberId,
        bookId,
      );
      // 2.1 Borrow date
      const borrowDate = borrows.find(
        (br) => br.bookid === bookId,
      )?.borrowsdate;
      //2.2 Return date
      const returnDate = borrows.find((br) => (br.returndate = new Date()));
      //2.3 Get the number of borrowing days
      const borrowDays = Math.ceil(
        (returnDate.returndate - borrowDate.borrowsdate) /
          (1000 * 60 * 60 * 24),
      );
      // 2.3 If more than 7 days, update member is penalized = true and set penalty end date
      if (borrowDays > 7) {
        await this.databaseService.updatePenalized(memberId);
        throw new BadRequestException(
          'The book was borrowed for more than seven days, and the member has been penalized for 3 days.',
        );
      } else {
        // 3. If all check passed, procceed to return book and update the data
        await this.databaseService.updateBorrow(memberId, bookId);
      }
      return { message: 'Book successfully return.' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
