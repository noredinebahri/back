const app = require("express")();
require('dotenv').config();
require("./core/core.model");
const http = require('http');

const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server, {
  cors: {
    origin: '*', // À restreindre en production
    methods: ['GET', 'POST',  'PUT', 'DELETE'],
  }
});
module.exports.io = io;

const cors = require("cors");
const bookingRoute = require("./app/booking/booking.route");
const dashboardRoute = require("./app/booking/dashboard/dashboard.route");
const transactionRoute = require("./app/booking/transaction/transaction.route");
const driverRoute  = require("./app/booking/driver/driver.route");
const authRoute = require("./app/user/auth/auth.route");
const taxiRoute = require("./app/taxi/taxiRoutes");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Bloque après 5 essais
    message: "Trop de tentatives, réessayez plus tard.",
  });
  
app.use(bodyParser.json());
app.use(cors());
const PORT = process.env.PORT;
const HOST = process.env.HOST2;
const VERSION = process.env.VERSION;
const URL = `http://${HOST}:${PORT}`;

// routes
app.use(`/api/${VERSION}/booking`, bookingRoute);
app.use(`/api/${VERSION}/dashboard`, dashboardRoute);
app.use(`/api/${VERSION}/auth`, authRoute);
app.use(`/api/${VERSION}/taxi`, taxiRoute);
app.use(`/api/${VERSION}/transactions`, transactionRoute);
app.use(`/api/${VERSION}/driver`, driverRoute);
// const Customers = require("./app/user/auth/auth.model");
const { Driver, Transaction, RideBooking } = require("./app/booking/booking.model");

async function initializeDatabase() {

  RideBooking.sync().then(() => {
  console.log('Customers table created successfully');
} );


}
// initializeDatabase();

io.on('connection', (socket) => {
  console.log('Un client est connecté', socket.id);

  socket.on('joinRoom', (room) => {
    console.log(`Socket ${socket.id} rejoint la room ${room}`);
    socket.join(room);
  });

  socket.on('disconnect', () => {
    console.log('Un client est déconnecté', socket.id);
  });
});

server.listen(PORT,HOST, () => {
    console.info(`${process.env.NODE_ENV}  | server connected at :${URL}`);
});