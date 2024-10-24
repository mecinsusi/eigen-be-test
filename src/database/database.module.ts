import { Module, Global } from '@nestjs/common';
import { Client } from 'pg';
import { DatabaseService } from './database.service';
import { MembersService } from '../members/members.service';
import { BorrowsService } from '../borrows/borrows.service';
import { BookService } from '../book/book.service';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () => {
        try {
          const client = new Client({
            host: process.env.POSTGRES_HOST,
            port: parseInt(String(process.env.POSGRES_PORT)),
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
          });
          await client.connect();
          console.log('Connected to the PostgreSQL database.');
          return client;
        } catch (error: any) {
          console.log(`Error connecting dhe database:`, error);
          throw new Error('Database connection failed.');
        }
      },
    },
    DatabaseService,
    MembersService,
    BorrowsService,
    BookService,
  ],
  exports: ['DATABASE_CONNECTION', DatabaseService],
})
export class DatabaseModule {}
