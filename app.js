const express = require('express');
const userRouter = require('./routes/userRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
// ****** Cron Jobs Import ******
// None
// ****** Security Imports ******
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cors = require('cors');

// Start express app
const app = express();

// Enable request body
app.use(express.json());

//Enable static
app.use('/public', express.static(__dirname + '/public'));

// ****** Security Settings ******
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// app.use(cors({
//   origin: 'https://localposts.web.app'
// }))
app.options('*', cors());

// Set security HTTP headers
app.use(helmet());
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
// Preventing Parameter Pollution
app.use(hpp());
// Compress code for production
app.use(compression());

// Routes
app.use('/api/v1/users', userRouter);


app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server`, 404));
});

//startReminderCronJob();
app.use(globalErrorHandler);

module.exports = app;
