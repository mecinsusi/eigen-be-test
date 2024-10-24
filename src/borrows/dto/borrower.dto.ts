import { ApiProperty } from '@nestjs/swagger';

export enum borrowedStatus {
  PENDING = 'PENDING',
  DONE = 'DONE',
}

export class CreateBorrowDto {
  @ApiProperty({
    description: 'id of the book',
  })
  bookId: number;

  @ApiProperty({
    description: 'id of the member',
  })
  memberId: number;

  @ApiProperty({
    description: 'borrowed date',
  })
  borrowedDate: string;

  @ApiProperty({
    description: 'return date',
  })
  returnDate: string;

  @ApiProperty({
    description: 'borrow status',
  })
  status: borrowedStatus;
}

export class BorrowDto {
  @ApiProperty({
    description: 'id of the member',
  })
  memberId: number;
  @ApiProperty({
    description: 'id of the book',
  })
  bookId: number;
}
