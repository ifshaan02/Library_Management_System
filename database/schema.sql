-- =====================================================================
-- Library Management System - MySQL Schema
-- Run this once against a fresh MySQL server to create the database.
-- Matches the EF Core model in LibraryManagementSystem.API exactly, so
-- you can use this INSTEAD of running EF migrations if you prefer.
-- (The API will also auto-create these tables on first run via
--  DbContext.Database.EnsureCreated(), so running this script is optional.)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS library_management
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE library_management;

-- ---------------------------------------------------------------------
-- Users (staff accounts: Admin / Librarian)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Users (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Username VARCHAR(50) NOT NULL,
  Email VARCHAR(150) NOT NULL,
  PasswordHash VARCHAR(255) NOT NULL,
  Role VARCHAR(20) NOT NULL DEFAULT 'Librarian',
  CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY UX_Users_Username (Username),
  UNIQUE KEY UX_Users_Email (Email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Categories (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Books
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Books (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  Title VARCHAR(255) NOT NULL,
  Author VARCHAR(150) NOT NULL,
  ISBN VARCHAR(20) NOT NULL,
  Publisher VARCHAR(150) NULL,
  PublishedYear INT NULL,
  CategoryId INT NOT NULL,
  TotalCopies INT NOT NULL DEFAULT 0,
  AvailableCopies INT NOT NULL DEFAULT 0,
  CoverImageUrl VARCHAR(500) NULL,
  CreatedAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY UX_Books_ISBN (ISBN),
  CONSTRAINT FK_Books_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
    ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Borrowers
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Borrowers (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  FullName VARCHAR(150) NOT NULL,
  Email VARCHAR(150) NOT NULL,
  Phone VARCHAR(20) NULL,
  Address VARCHAR(255) NULL,
  MembershipDate DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  IsActive TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY UX_Borrowers_Email (Email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Loans (circulation records)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Loans (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  BookId INT NOT NULL,
  BorrowerId INT NOT NULL,
  LoanDate DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  DueDate DATETIME(6) NOT NULL,
  ReturnDate DATETIME(6) NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'Active',
  FineAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  CONSTRAINT FK_Loans_Books FOREIGN KEY (BookId) REFERENCES Books(Id)
    ON DELETE RESTRICT,
  CONSTRAINT FK_Loans_Borrowers FOREIGN KEY (BorrowerId) REFERENCES Borrowers(Id)
    ON DELETE RESTRICT,
  INDEX IX_Loans_BookId (BookId),
  INDEX IX_Loans_BorrowerId (BorrowerId),
  INDEX IX_Loans_Status (Status)
) ENGINE=InnoDB;
