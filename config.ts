require('dotenv').config();

const { DATABASE_URL } = process.env
const { GOOGLE_CLIENT_ID } = process.env
const { GOOGLE_CLIENT_SECRET } = process.env
const { SESSION_SECRET } = process.env
const { REACT_APP_GOOGLE_CLIENT_ID } = process.env
const { NYT_API } = process.env
const { OPENAI_API_KEY } = process.env
const { GOOGLE_BOOKS } = process.env
const { GOOGLE_MAPS_API_KEY } = process.env

module.exports = {
  DATABASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SESSION_SECRET, REACT_APP_GOOGLE_CLIENT_ID, NYT_API, OPENAI_API_KEY, GOOGLE_BOOKS,
  GOOGLE_MAPS_API_KEY
};
