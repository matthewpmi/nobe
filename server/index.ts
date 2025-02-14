
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

//Routes
import UserBooks from './routes/userbooks';
import LocationRoute from './routes/booksnearuser';
import Clubs from './routes/clubs';
import CreateClub from './routes/createClub';
import Trending from './routes/Trending';
import Recommendations from './routes/recommendations';
import Review from './routes/review';
import Wishlist from './routes/wishlist';
import OpenAI from './routes/OpenAI';
import BookData from './routes/BookData';
import User from './routes/User';
import GoogleBooks from './routes/GoogleBooks';




dotenv.config();
const app = express();
const CLIENT_PATH = path.resolve(__dirname, '../client/build');
const PORT = 8080;
const prisma = new PrismaClient();

//Middleware
app.use(express.static(CLIENT_PATH));

const allowedOrigins = ['http://ec2-18-119-156-72.us-east-2.compute.amazonaws.com:8080', 'http://localhost:8080', '/'];

app.use(cors({
  origin: allowedOrigins,
}));
//app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());




//routes
app.use("/location", LocationRoute);
app.use("/recommendations", Recommendations);
app.use("/books", UserBooks);
app.use('/review', Review);
// app.use("/clubs", Clubs);
app.use("/api/clubs", Clubs);
app.use('/api/create-club', CreateClub);
app.use("/api/trending", Trending);
app.use("/api/wishlist", Wishlist);
app.use("/openai", OpenAI);
app.use("/bookdata", BookData);
app.use("/user", User);
app.use("/google-books", GoogleBooks);



//Authentication

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token: string) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    return { payload: ticket.getPayload() };
  } catch (error) {
    return { error: "Invalid user detected. Please try again" };
  }
}

app.post("/signup", async (req, res) => {
  console.log(req.body);
  try {
    // console.log({ verified: verifyGoogleToken(req.body.credential) });
    if (req.body.credential) {
      const verificationResponse = await verifyGoogleToken(req.body.credential);

      if (verificationResponse.error) {
        return res.status(400).json({
          message: verificationResponse.error,
        });
      }

      const profile = verificationResponse?.payload;

      if (!profile) {
        return res.status(400).json({
          message: "Unable to retrieve user profile",
        });
      }

      //this needs to be changed to add the user to the database
      // DB.push(profile);
      const createdUser = await prisma.user.create({
        data: {
          firstName: profile.given_name ?? "",
          lastName: profile.family_name ?? "",
          email: profile.email ?? "",
          googleId: profile.sub,
          picture: profile.picture ?? "",
        },
      });


      let unique_id = createdUser.id;

      res.status(201).json({
        message: "Signup was successful",
        user: {
          firstName: profile?.given_name,
          lastName: profile?.family_name,
          picture: profile?.picture,
          id: unique_id,
          email: profile?.email,
          token: jwt.sign({ email: profile?.email }, "mySecret", {
            expiresIn: "1d",
          }),
        },
      });
    }
  } catch (error) {
    console.error(error),
      res.status(500).json({
        message: "An error occurred. Registration failed.",
      });
  }
});

app.get("/Login", async (req, res) => {
  const email = req.query.email as string;
  const profile = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  console.log(profile);

  if (profile) {
    res.status(200).json({
      message: "Login was successful",
      user: {
        firstName: profile.firstName,
        googleId: profile.googleId,
        id: profile.id,
        email: profile.email,
        // token: jwt.sign({ email: profile.email }, process.env.JWT_SECRET as jwt.Secret, {
        //   expiresIn: "1d",
        // }),
      },
    });
  } else {
    res.status(404).json({
      message: "User not found",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    if (req.body.credential) {
      const verificationResponse = await verifyGoogleToken(req.body.credential);
      if (verificationResponse.error) {
        console.error(verificationResponse.error);
        return res.status(400).json({
          message: verificationResponse.error,

        });
      }
      const profile = verificationResponse?.payload;

      if (!profile) {
        return res.status(400).json({
          message: "Unable to retrieve user profile",
        });
      }
      const email = profile.email
      const getUser  = await axios.get(`http://localhost:8080/user?email=${email}`)
      const userData = getUser.data
      // const existsInDB = DB.find((person) => person?.email === profile?.email);
      //console.log(userData)
      if (!userData) {
        return res.status(400).json({
          message: "You are not registered. Please sign up",
        });
      }
      userData.token = jwt.sign({ email: profile?.email }, process.env.JWT_SECRET as jwt.Secret, {
        expiresIn: "1d",
      }),

      res.status(201).json({
        message: "Login was successful",
        user: {
          // firstName: profile?.given_name,
          // lastName: profile?.family_name,
          // picture: profile?.picture,
          // id: userData.id,
          // email: profile?.email,
          // token: jwt.sign({ email: profile?.email }, process.env.JWT_SECRET as jwt.Secret, {
          //   expiresIn: "1d",
          // }),
          userData
        },
      });
    }
  } catch (error: any) {
    res.status(500).json({
      message: error?.message || error,
    });
  }
});





//make sure this is the last route in our server
app.get('*', (req, res) => {
  res.sendFile(path.resolve('./client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on :${PORT}`);
});
