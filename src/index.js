import { PORT } from './utils/config';
import { Server as WebsocketServer } from 'socket.io';
import http from 'http';
import sockets from './sockets';
import app from './utils/app';
import { connectDB } from './utils/db';

connectDB();

const server = http.createServer(app);
const httpServer = server.listen(PORT);
const io = new WebsocketServer(httpServer, { cors: { origin: '*' } });

sockets(io);

console.log('Server rodando na porta 3000');
