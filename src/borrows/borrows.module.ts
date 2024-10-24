import { Module } from '@nestjs/common';
import { BorrowerController } from './borrows.controller';
import { BorrowsService } from './borrows.service';
import { DatabaseModule } from '../database/database.module';
import { MembersService } from '../members/members.service';
import { DatabaseService } from '../database/database.service';
import { TestingModule } from '@nestjs/testing';

@Module({
  imports: [DatabaseModule],
  controllers: [BorrowerController],
  providers: [BorrowsService, MembersService, DatabaseService],
})
export class BorrowsModule {}
