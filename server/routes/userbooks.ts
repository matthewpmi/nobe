const express = require('express');
const axios = require('axios')
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const UserBooks = express.Router();

UserBooks.post('/:id', async (req, res) => {
  try {
    const { title, wishlist, owned } = req.body;
    const { id } = req.params
    // make request to get book from API
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${title}&key=`);
    const bookData = response.data.items[0].volumeInfo;

    // add book to database
    const createdBook = await prisma.books.create({
      data: {
        title: bookData.title,
        author: bookData.authors[0],
        description: bookData.description,
        genre: { create: bookData.categories.map(name => ({ name })) },
        paperback: bookData.printType === 'BOOK',
        content: bookData.contentVersion,
        user: { connect: { id: id } },
        UserBooks: {
          create: {
            wishlist,
            owned,
            user: { connect: { id: id } },
          },
        },
      },
      include: {
        UserBooks: true,
      },
    });

    res.json(createdBook);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = UserBooks;
