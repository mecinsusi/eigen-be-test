import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly client: Client,
  ) {}

  async query(query: string, params?: any[]) {
    return this.client.query(query, params);
  }

  // Initial Database create table and insert data
  async initialDatabase() {
    await this.createBooksTable();
    await this.createMembersTable();
    await this.createBorrowersTable();
    await this.insertDataBooks();
    await this.insertDataMembers();
  }
  //---------------------------------CREATE TABLE--------------------------------------//
  // Create a book table
  async createBooksTable() {
    const query = `CREATE TABLE IF NOT EXISTS books (
      id BIGSERIAL PRIMARY KEY,
      code VARCHAR(100) NOT NULL,
      title VARCHAR(100) NOT NULL,
      author VARCHAR(100) NOT NULL,
      stock BIGSERIAL NOT NULL
      );
      `;
    await this.client.query(query);
    console.log(`Succesfully create the books table.`);
  }
  // Create a member table
  async createMembersTable() {
    const query = `CREATE TABLE IF NOT EXISTS members (
      id BIGSERIAL PRIMARY KEY,
      code VARCHAR(100) NOT NULL,
      name VARCHAR(100) NOT NULL,
      isPenalized BOOLEAN DEFAULT false,
      penalty_end_date DATE
      );
      `;
    await this.client.query(query);
    console.log(`Succesfully create the members table.`);
  }

  //Create a borrowerStatus ENUM
  async createEnumBorrowsStatus() {
    const checkEnum = await this.query(
      `SELECT 1 FROM pg_type
       WHERE typname = 'borrowsStatus'`,
    );
    if (checkEnum.rows.length === 0) {
      await this.query(`CREATE TYPE borrowsStatus
                       AS ENUM ('PENDING', 'DONE');
                       `);
    } else {
      console.log(`Enum borrowsStatus already exists.`);
    }
  }

  // Create a borrows table
  async createBorrowersTable() {
    const query = `CREATE TABLE IF NOT EXISTS borrows (
      id BIGSERIAL PRIMARY KEY,
      bookId BIGINT REFERENCES books(id) ON DELETE CASCADE,
      memberId BIGINT REFERENCES members(id) ON DELETE CASCADE,
      borrowsDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      returnDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status borrowsStatus DEFAULT 'DONE'
      );
      `;
    try {
      await this.client.query(query);
      console.log(`Succesfully create the borrower table`);
    } catch (err) {
      console.log(`Error creating borrowers table:`, err);
    }
  }

  //---------------------------------INSERT DATA OF TABLE--------------------------------------//

  //Check if the books table is empty, insert the data
  async insertDataBooks() {
    const result = await this.query(`SELECT COUNT(*) FROM books`);
    //Convert the value of row count from query (string) to integer
    const count = parseInt(result.rows[0].count, 10);

    if (count === 0) {
      console.log(`Inserting books data table`);
      // Array of book data table
      const books = [
        ['JK-45', 'Harry Potter', 'J.K Rowling', 1],
        ['SHR-1', 'A Study in Scarlet', 'Arthur Conan Doyle', 1],
        ['TW-11', 'Twilight', 'Stephenie Meyer', 1],
        ['HOB-83', 'The Hobbit, or There and Back Again', 'J.R.R. Tolkien', 1],
        ['NRN-7', 'The Lion, the Witch and the Wardrobe', 'C.S. Lewis', 1],
      ];
      //Generate query placeholders dynamically
      const values = books.flat();
      const valuePlaceholders = books
        .map((_, index) => {
          const baseIndex = index * 4;
          return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4})`;
        })
        .join(', ');

      //Bulk insert the book data
      const query = `
    INSERT INTO books (code, title, author, stock)
    VAlUES ${valuePlaceholders}
    `;
      await this.client.query(query, values);
      console.log('Succesfully insert books data.');
    } else {
      console.log(`Data in the books table already exists.`);
    }
  }

  //Check if the members table empty, insert the data
  async insertDataMembers() {
    const result = await this.query(`SELECT COUNT(*) FROM members`);
    //Convert the value of row count from query (string) to integer
    const count = parseInt(result.rows[0].count, 10);

    if (count === 0) {
      //Array of member data table
      const members = [
        ['M001', 'Angga'],
        ['M002', 'Ferry'],
        ['M003', 'Putri'],
      ];
      //Generate query placeholders dynamically
      const values = members.flat();
      const valuePlaceholders = members
        .map((_, index) => {
          const baseIndex = index * 2;
          return `($${baseIndex + 1}, $${baseIndex + 2})`;
        })
        .join(', ');
      //Bulk insert the member data
      const query = `
      INSERT INTO members (code, name)
      VAlUES ${valuePlaceholders}
      `;
      await this.client.query(query, values);
      console.log(`Succesfully insert members data.`);
    } else {
      console.log(`Data in the members table already exists.`);
    }
  }

  //Insert  data  to borrows table
  async inputBorrows(data: {
    bookId: number;
    memberId: number;
    borrowedDate: Date;
    returnDate: Date | null;
    status: string;
  }) {
    const query = `INSERT INTO borrows
    (bookId, memberId, borrowsDate, returnDate, status)
    VALUES ($1, $2, $3, $4, $5)`;
    const values = [
      data.bookId,
      data.memberId,
      data.borrowedDate,
      data.returnDate,
      data.status,
    ];
    const res = await this.client.query(query, values);
    console.log(`Succesfully insert data create borrows.`);
    return res.rows[0];
  }

  //---------------------------------GET DATA--------------------------------------//

  //Get all books data table
  async getAllBook() {
    const query = `SELECT * FROM books`;
    const result = await this.client.query(query);
    return result.rows;
  }

  //Get member by Id
  async getMemberById(memberId: number) {
    const query = {
      text: `SELECT * FROM members
      WHERE members.id = $1`,
      values: [memberId],
    };
    const result = await this.client.query(query);
    console.log(`Penalty date`, result.rows);
    return result.rows;
  }

  //Get all borrows data table
  async getAllBorrows(memberId: number, bookId: number) {
    const query = {
      text: `SELECT * FROM borrows br
      WHERE br.memberId = $1
      AND br.bookId = $2;`,
      values: [memberId, bookId],
    };
    const result = await this.client.query(query);
    return result.rows;
  }

  //Get penalty end date
  async getPenaltyEndDate(memberId: number) {
    const query = {
      text: `
      SELECT m.penalty_end_date FROM members m
      WHERE m.id = $1
      `,
      values: [memberId],
    };
    const result = await this.client.query(query);
    console.log(`Penalty end date`, result.rows);
    return result.rows[0].penalty_end_date;
  }

  //Get return date
  async getReturnDate(memberId: number, bookId: number) {
    const query = {
      text: `SELECT returnDate
      FROM borrows
      WHERE memberId = $1
      AND bookId = $2`,
      values: [memberId, bookId],
    };
    const result = await this.client.query(query);
    return result.rows;
  }

  //Get all members and borrows status
  async getMemberBorrowBook() {
    const query = `
    SELECT m.id, m.name, COUNT(br.memberid) AS borrowedBook
    FROM members m
    LEFT JOIN borrows br ON m.id = br.memberid
    AND br.status = 'PENDING'
    LEFT JOIN books b on b.id = br.bookid
    GROUP BY m.id, m."name"
    `;
    const result = await this.client.query(query);
    return result.rows;
  }

  //Get avaliable book (status = DONE or null)
  async getAvaliableBook() {
    const query = `SELECT * FROM books b
    WHERE NOT b.id = any
    (SELECT b.id FROM books b
    LEFT JOIN borrows br on b.id = br.bookid
    WHERE  br.status = 'PENDING'
    AND br.bookid IS NOT null)
  `;
    const result = await this.client.query(query);
    return result.rows;
  }

  //Get penalized member
  async isPenalizedMember(memberId: number) {
    const query = {
      text: `
    SELECT m.isPenalized
    FROM members m
    WHERE m.id = $1
      `,
      values: [memberId],
    };
    const result = await this.client.query(query);
    return result.rows[0].ispenalized;
  }

  //Get count of borrowed books by member
  async getBorrowedBooksCount(memberId: number) {
    const query = {
      text: `SELECT COUNT(*) FROM members m
      LEFT JOIN borrows br on m.id = br.memberid
      LEFT JOIN books b on b.id = br.bookid
      WHERE br.status = 'PENDING'
      AND m.id = $1`,
      values: [memberId],
    };
    const res = await this.client.query(query);
    const count = parseInt(res.rows[0].count, 10);
    return count;
  }

  //---------------------------------UPDATE--------------------------------------//

  //Update borrows by memberId and bookId
  async updateBorrow(memberId: number, bookId: number) {
    const query = {
      text: `UPDATE borrows
      SET status = 'DONE', returnDate = NOW()
      WHERE bookid  = $1
      AND memberid  = $2;`,
      values: [bookId, memberId],
    };
    const result = await this.client.query(query);
    console.log(`update borrow`, result.rows);
    return result.rows;
  }

  //Update penalized memberId
  async updatePenalized(memberId: number) {
    const query = {
      text: `UPDATE members
      SET isPenalized = true,
      penalty_end_date = date_trunc('days', 3 + current_date)
      WHERE id = $1`,
      values: [memberId],
    };
    const result = await this.client.query(query);
    return result.rows;
  }

  //Update clear penalized memberId
  async updateClearPenalized(memberId: number) {
    const query = {
      text: `UPDATE members
      SET isPenalized = false
      WHERE id = $1`,
      values: [memberId],
    };
    const result = await this.client.query(query);
    return result.rows;
  }

  //---------------------------------IS?--------------------------------------//

  //is Book avaliable
  async isBookAvaliable(bookId: number) {
    const query = {
      text: `
    SELECT CASE WHEN COUNT(*) = 0 then true else false end
    AS is_avaliable FROM books b
    LEFT JOIN borrows br ON b.id = br.bookid
    WHERE b.id = $1
    AND br.status = 'PENDING';
    `,
      values: [bookId],
    };
    const result = await this.client.query(query);
    return result.rows[0].is_avaliable;
  }

  //isBookBorrowedbyMember
  async isBookBorrowedByMember(memberId: number, bookId: number) {
    const query = {
      text: `
      SELECT case when count(*) = 1 then true else false end as is_borrowed FROM members m
      LEFT JOIN borrows br on m.id = br.memberid
      LEFT JOIN books b on b.id = br.bookid
      WHERE br.status = 'PENDING'
      AND m.id = $1
      AND b.id = $2;
    `,
      values: [memberId, bookId],
    };
    const result = await this.client.query(query);
    return result.rows[0].is_borrowed;
  }

  async onModuleDestroy() {
    await this.client.end();
    console.log('Disconnected from PostgreSQL database.');
  }
}
