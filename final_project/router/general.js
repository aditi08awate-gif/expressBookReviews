const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();  

// Promise that resolves with the book database
const getBooksPromise = () => new Promise((resolve) => resolve(books));

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "Username and password required" });
  if (users.find(u => u.username === username))
    return res.status(409).json({ message: "User already exists" });
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Get all books (async/await with a Promise)
public_users.get('/', async (req, res) => {
  const allBooks = await getBooksPromise();
  res.status(200).send(JSON.stringify(allBooks, null, 4));
});

// Get book by ISBN (Promise callbacks)
public_users.get('/isbn/:isbn', (req, res) => {
  getBooksPromise()
    .then((allBooks) => {
      const book = allBooks[req.params.isbn];
      if (!book) return res.status(404).json({ message: "Book not found" });
      res.status(200).json(book);
    })
    .catch(() => res.status(500).json({ message: "Error" }));
});

// Get books by author (async/await)
public_users.get('/author/:author', async (req, res) => {
  const allBooks = await getBooksPromise();
  const result = Object.values(allBooks).filter(b => b.author === req.params.author);
  res.status(200).json(result);
});

// Get books by title (async/await)
public_users.get('/title/:title', async (req, res) => {
  const allBooks = await getBooksPromise();
  const result = Object.values(allBooks).filter(b => b.title === req.params.title);
  res.status(200).json(result);
});

// Get book reviews
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  res.status(200).json(book.reviews);
});

// ===== Axios client functions =====
const BASE = 'http://localhost:5000';

// Task 10: Get all books using async/await with Axios
const getAllBooks = async () => {
  try {
    const response = await axios.get(`${BASE}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all books:", error.message);
  }
};

// Task 11: Search by ISBN using Promise callbacks with Axios
const getByISBN = (isbn) =>
  axios.get(`${BASE}/isbn/${isbn}`)
    .then((response) => response.data)
    .catch((error) => console.error("Error fetching by ISBN:", error.message));

// Task 12: Search by author using async/await with Axios
const getByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE}/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching by author:", error.message);
  }
};

// Task 13: Search by title using async/await with Axios
const getByTitle = async (title) => {
  try {
    const response = await axios.get(`${BASE}/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching by title:", error.message);
  }
};

// Run directly with: node router/general.js  (server must be running)
if (require.main === module) {
  getAllBooks().then((d) => console.log("All books:", d));
  getByISBN(8).then((d) => console.log("By ISBN 8:", d));
  getByAuthor("Jane Austen").then((d) => console.log("By author:", d));
  getByTitle("Pride and Prejudice").then((d) => console.log("By title:", d));
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getByISBN = getByISBN;
module.exports.getByAuthor = getByAuthor;
module.exports.getByTitle = getByTitle;
