import mongoose from 'mongoose';
import { MONGO_CONNECTION_URL } from './config';

export const connectDB = async () => {
  mongoose.connect(MONGO_CONNECTION_URL, {}, (error) => {
    if (error) {
      console.log(error);
    }
    if (!error) {
      console.log('Banco conectado');
    }
  });
};
