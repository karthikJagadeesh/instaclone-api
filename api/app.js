const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const signupRouter = require('./controllers/signup');
const changeProfilePicRouter = require('./controllers/changeProfilePic');
const postRouter = require('./controllers/post');
const profilePostsRouter = require('./controllers/profilePosts');

const middleware = require('./utils/middlewares');
const config = require('./utils/config');

const app = express();

mongoose
  .connect(config.MONGODB_URI, { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB:', error.message));

cloudinary.config({
  cloud_name: config.CLOUDINARY_NAME,
  api_key: config.CLOUDINARY_KEY,
  api_secret: config.CLOUDINARY_SECRET
});

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('tiny'));

app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/change-profile-pic', changeProfilePicRouter);
app.use('/post', postRouter);
app.use('/profile-posts', profilePostsRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

app.listen(config.PORT, () => console.log(`Listening on port: ${config.PORT}`));

module.exports = app;
