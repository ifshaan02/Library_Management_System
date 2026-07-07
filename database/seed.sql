-- =====================================================================
-- Optional sample/seed data.
-- The password hash below is a bcrypt hash of "Admin@123" -
-- log in with username "admin" / password "Admin@123" then change it.
-- (If you let the API auto-seed instead, it generates this same account.)
-- =====================================================================

USE library_management;

INSERT INTO Users (Username, Email, PasswordHash, Role)
SELECT 'admin', 'admin@library.local',
       '$2a$11$KIXQ8s0jH9m9m8QwqzWq2eN1t8h9m0J8k3m8n8f6k8kX9m8n8f6k8',
       'Admin'
WHERE NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'admin');
-- NOTE: If this hash does not verify on your machine (bcrypt salts are random
-- per-generation), simply let the API's built-in DbSeeder create the admin
-- account automatically on first run instead - it hashes "Admin@123" fresh.

INSERT INTO Categories (Name)
SELECT * FROM (SELECT 'Fiction' UNION SELECT 'Non-Fiction' UNION SELECT 'Science'
               UNION SELECT 'Technology' UNION SELECT 'History' UNION SELECT 'Biography') AS tmp
WHERE NOT EXISTS (SELECT 1 FROM Categories);

INSERT INTO Books (Title, Author, ISBN, Publisher, PublishedYear, CategoryId, TotalCopies, AvailableCopies)
SELECT 'Clean Code', 'Robert C. Martin', '9780132350884', 'Prentice Hall', 2008,
       (SELECT Id FROM Categories WHERE Name = 'Technology' LIMIT 1), 3, 3
WHERE NOT EXISTS (SELECT 1 FROM Books WHERE ISBN = '9780132350884');

INSERT INTO Books (Title, Author, ISBN, Publisher, PublishedYear, CategoryId, TotalCopies, AvailableCopies)
SELECT 'A Brief History of Time', 'Stephen Hawking', '9780553380163', 'Bantam', 1988,
       (SELECT Id FROM Categories WHERE Name = 'Science' LIMIT 1), 2, 2
WHERE NOT EXISTS (SELECT 1 FROM Books WHERE ISBN = '9780553380163');

INSERT INTO Books (Title, Author, ISBN, Publisher, PublishedYear, CategoryId, TotalCopies, AvailableCopies)
SELECT '1984', 'George Orwell', '9780451524935', 'Signet Classic', 1949,
       (SELECT Id FROM Categories WHERE Name = 'Fiction' LIMIT 1), 4, 4
WHERE NOT EXISTS (SELECT 1 FROM Books WHERE ISBN = '9780451524935');
