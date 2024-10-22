/* eslint-disable no-param-reassign */
/* eslint-disable import/no-extraneous-dependencies */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import responseTime from 'response-time';
import { Server } from 'socket.io';
import http from 'http';

// Initialize Express
const app = express();

// PORT
const PORT = process.env.PORT || 5000;

// Secure HTTP headers
app.use(helmet());

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// load the cookie-parsing middleware
app.use(cookieParser());

// Create a middleware that adds a X-Response-Time header to responses.
app.use(responseTime());

// Configure CORS policy
const whitelist = [
  process.env.CLIENT_APP_DOMAIN,
];

const corsMiddlewareOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      const msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
      callback(new Error(msg));
    }
  },
};

// Enable pre-flight request for form-data requests
app.options('*', cors()); // include before other routes

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(cors(corsMiddlewareOptions));

// routes

// Start WebSocket
const server = http.createServer(app);

// use it in controller
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_APP_DOMAIN,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket'],
});

// Start the server
// eslint-disable-next-line no-console
server.listen(PORT, () => console.log(`Server started and listeningg on ${PORT}`));
