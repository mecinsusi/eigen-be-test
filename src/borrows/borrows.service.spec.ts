import { Test, TestingModule } from '@nestjs/testing';
import { BorrowsService } from './borrows.service';
import { ModuleMocker } from 'jest-mock';
import { DatabaseService } from '../database/database.service';
import { MembersService } from '../members/members.service';
import { BadRequestException, HttpException } from '@nestjs/common';

const moduleMocker = new ModuleMocker(global);

describe('BorrowersService', () => {
  let borrowsService: BorrowsService;
  let databaseService: DatabaseService;
  let memberService: MembersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BorrowsService],
    })
      .useMocker((token) => {
        if (token === DatabaseService) {
          return {
            isPenalizedMember: jest.fn().mockResolvedValue(false),
            getPenaltyEndDate: jest
              .fn()
              .mockResolvedValue(
                new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
              ),
            getBorrowedBooksCount: jest.fn().mockResolvedValue(null),
            isBookAvaliable: jest.fn().mockResolvedValue(true),
            isBookBorrowedByMember: jest.fn().mockResolvedValue(true),
          };
        }
        if (token === MembersService) {
          return {
            borrowBookForMemberService: jest.fn().mockResolvedValue(null),
          };
        }
      })
      .compile();

    borrowsService = module.get<BorrowsService>(BorrowsService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    memberService = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(borrowsService).toBeDefined();
  });

  const memberId = 1;
  const bookId = 1;
  //----------------------Borrow----------------------------------------------//
  it('should throw an error if the member is penalized and the penalty periode has not passed', async () => {
    jest.spyOn(databaseService, 'isPenalizedMember').mockResolvedValue(true);

    await expect(
      borrowsService.createBorrowsService(memberId, bookId),
    ).rejects.toThrow(HttpException);
  });
  //
  it('should throw an error if the member has borrowed more than 2 books', async () => {
    jest.spyOn(databaseService, 'getBorrowedBooksCount').mockResolvedValue(2);

    await expect(
      borrowsService.createBorrowsService(memberId, bookId),
    ).rejects.toThrow(
      new BadRequestException('Member cannot borrow more than 2 books.'),
    );
  });
  //
  it('should throw an error if the book is not avaliable', async () => {
    jest.spyOn(databaseService, 'isBookAvaliable').mockResolvedValue(false);

    await expect(
      borrowsService.createBorrowsService(memberId, bookId),
    ).rejects.toThrow(
      new BadRequestException('Book is already borrowed by another member.'),
    );
  });
  //
  it('should allow the member to borrow if the penalty period has passed', async () => {
    const result = await borrowsService.createBorrowsService(memberId, bookId);
    expect(result).toEqual({ message: 'Book borrowed successfully.' });
  });
  //
  ////----------------------Return----------------------------------------------//
  it('should throw an exception if the book was not borrowed by the member', async () => {
    await expect(
      borrowsService.returnBook(memberId, bookId),
    ).rejects.toThrow(HttpException);
  });
});
