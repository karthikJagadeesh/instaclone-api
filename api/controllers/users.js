const usersRouter = require('express').Router();
const User = require('../models/User');

usersRouter.get('/', async (_, response) => {
  const users = await User.find({});
  const parsedUsers = await users.map(user => user.toJSON());
  response.json(parsedUsers);
});

module.exports = usersRouter;
