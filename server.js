const app = require("express")();
require('dotenv').config();
require("./core/core.model");
const cors = require("cors");
const bookingRoute = require("./app/booking/booking.route");
const authRoute = require("./app/user/auth/auth.route");
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
app.use(`/api/${VERSION}/auth`, authRoute);
const Customers = require("./app/user/auth/auth.model");

async function initializeDatabase() {

// Customers.sync().then(() => {
//   console.log('Customers table created successfully');
// } );
}
initializeDatabase();
app.listen(PORT,HOST, () => {
    console.info(`${process.env.NODE_ENV}  | server connected at :${URL}`);
});