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
    const data = await User.findById(_id, '-password');
    response.status(200).json({ data });
  } catch (error) {
    console.error(error);
    response.status(401).json({ error: 'This userId does not exist' });
  }
});

usersRouter.put('/:id', async (request, response) => {
  const id = request.params.id;
  const update = request.body;

  try {
    const _email = await User.find({
      email: update.email,
      _id: { $ne: id }
    });
    if (_email.length) {
      return response.status(401).json({
        error: `Another account is using ${update.email}`
      });
    }

    const name = await User.find({
      userName: update.userName,
      _id: { $ne: id }
    });
    if (name.length) {
      return response.status(401).json({
        error: "This username isn't available. Please try another."
      });
    }

    const data = await User.findByIdAndUpdate(id, update, {
      select: '-password',
      new: true
    });
    response.status(200).json({ data, message: 'Profile saved' });
  } catch (error) {
    console.error(error);
    response.status(401).json({ error: 'This userId doesn not exist' });
  }
});

module.exports = usersRouter;
