const usersRouter = require('express').Router();
const User = require('../models/User');

usersRouter.get('/', async (_, response) => {
  const users = await User.find({}, '-password');
  const parsedUsers = await users.map(user => user.toJSON());
  response.json(parsedUsers);
});

usersRouter.get('/:id', async (request, response) => {
  const _id = request.params.id;
  try {
    const user = await User.findById(_id, '-password');
    response.status(200).json(user);
  } catch (error) {
    console.error(error);
    response.status(401).json({ error: 'This userId does not exist' });
  }
});

module.exports = usersRouter;
