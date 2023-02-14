import { config } from 'dotenv';

config();

export const PORT = process.env.PORT || 3000;
export const MONGO_CONNECTION_URL =
  process.env.MONGO_CONNECTION_URL ||
  'mongodb+srv://thgomes:1234@database.mbwlp.mongodb.net/study?retryWrites=true&w=majority';
