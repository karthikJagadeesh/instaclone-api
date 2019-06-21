const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const usersRouter = require('./controllers/users');

const middleware = require('./utils/middlewares');
const config = require('./utils/config');

const app = express();

mongoose
  .connect(config.MONGODB_URI, { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB:', error.message));

app.use(express.static('build'));
app.use(bodyParser.json());
app.use(morgan('tiny'));

app.use('/users', usersRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

app.listen(config.PORT, () => console.log(`Listening on port: ${config.PORT}`));

module.exports = app;
