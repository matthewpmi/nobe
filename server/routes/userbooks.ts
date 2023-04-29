const express = require('express');
const axios = require('axios')
const { PrismaClient } = require('@prisma/client');
import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
  user: {
    id: string;

  };
}

const prisma = new PrismaClient();
const UserBooks = express.Router();

UserBooks.post('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { inventory } = req.body;
    const googleTitle = req.body.title
    const { id } = req.params;
    let wishlist;
    let owned;
    if (inventory === 'Wishlist') {
      wishlist = true;
    } else {
      owned = true;
    }

    console.log('inventory', inventory)

    //console.log()
    const response = await axios.get(`http://localhost:8080/google-books?title=${googleTitle}`);
    const { title, ISBN10, author, image, description } = response.data
    //console.log(title, ISBN10, author, image, description )




    const newBook = await axios.post(`http://localhost:8080/bookdata/title/wishlist`, {
      title: title,
      ISBN10: ISBN10,
      author: author,
      image: image,
      description: description,

    })
    const bookID = newBook.data.id
    const userBook = await prisma.userBooks.create({
      data: {
        wishlist,
        owned,
        User: { connect: { id: id } },
        Books: { connect: { id: bookID } },
      },
      include: { Books: true },
    })

    const activity = await prisma.activity.create({
      data: {
        userId: id,
        type: (wishlist ? "Wishlist" : "Owned"),
        bookId: bookID,
      },
    })


    res.sendStatus(200)
  }
  //);

  // }
  //}
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


UserBooks.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userBooks = await prisma.userBooks.findMany({
      where: {
        userId: id
      },
      include: {
        books: true
      }
    });
    // const books = userBooks.map((userBook: UserBooks) => userBook.books);
    res.json(userBooks);
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Something went wrong' })
  }
});

interface UserBooksQuery {
  where: {
    userId: string;
    owned?: boolean;
    wishlist?: boolean;
  };
  include: {
    books: true;
  };
}

// UserBooks.get('/:id/:type', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const { id, type } = req.params;

//     let userBooksQuery: UserBooksQuery = {
//       where: {
//         userId: id
//       },
//       include: {
//         books: true
//       }
//     };

//     if (type === 'Owned') {
//       userBooksQuery.where = {
//         ...userBooksQuery.where,
//         owned: true
//       };
//     } else if (type === 'Wishlist') {
//       userBooksQuery.where = {
//         ...userBooksQuery.where,
//         wishlist: true
//       };
//     }

//     const userBooks = await prisma.userBooks.findMany(userBooksQuery);

//     res.json(userBooks);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Something went wrong' });
//   }
// });

// UserBooks.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const bookId = req.body.bookId;
//     const userId = req.params.id;

//     await prisma.userBooks.deleteMany({
//       where: {
//         userId: userId,
//         booksId: bookId
//       }
//     });

//     res.status(200).json({ message: 'Book removed.' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error removing book.' });
//   }
// });


export default UserBooks;
