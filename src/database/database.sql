-- Create books table
    CREATE TABLE IF NOT EXISTS books (
      id BIGSERIAL PRIMARY KEY,
      code VARCHAR(100) NOT NULL,
      title VARCHAR(100) NOT NULL,
      author VARCHAR(100) NOT NULL,
      stock BIGSERIAL NOT NULL
      );

-- Create member table
    CREATE TABLE IF NOT EXISTS members (
      id BIGSERIAL PRIMARY KEY,
      code VARCHAR(100) NOT NULL,
      name VARCHAR(100) NOT NULL,
      isPenalized BOOLEAN DEFAULT false,
      penalty_end_date DATE
      );

-- Create bororwer table
    CREATE TABLE IF NOT EXISTS borrowers (
      id BIGSERIAL PRIMARY KEY,
      book_id BIGSERIAL REFERENCES books(id) ON DELETE CASADE,
      member_id BIGSERIAL REFERENCES members(id) ON DELETE CASADE,
      borrowed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      return_date TIMESTAMP,
      status borrowsStatus
      );

