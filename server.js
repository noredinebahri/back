const app = require("express")();
require('dotenv').config();
require("./core/core.model");
const cors = require("cors");
const bookingRoute = require("./app/booking/booking.route");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(cors());
const PORT = process.env.PORT;
const HOST = process.env.HOST2;
const VERSION = process.env.VERSION;
const URL = `http://${HOST}:${PORT}`;

// routes
app.use(`/api/${VERSION}/booking`, bookingRoute);
app.listen(PORT,HOST, () => {
    console.info(`${process.env.NODE_ENV}  | server connected at :${URL}`);
});