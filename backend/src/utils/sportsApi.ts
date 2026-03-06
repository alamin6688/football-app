import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const sportsApi = axios.create({
  baseURL: process.env.SPORTS_DB_BASE_URL,
  headers: {
    'X-API-KEY': process.env.SPORTS_DB_KEY,
  },
});

export default sportsApi;
