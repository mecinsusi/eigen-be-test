import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { BookModule } from './book/book.module';
import { MembersModule } from './members/members.module';
import { BorrowsModule } from './borrows/borrows.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    BookModule,
    MembersModule,
    BorrowsModule,
  ],
})
export class AppModule {}
