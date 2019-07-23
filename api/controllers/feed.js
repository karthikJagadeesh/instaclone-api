const feedRouter = require('express').Router();

const User = require('../models/User');

feedRouter.get('/suggestions', async (request, response) => {
  const id = request.get('x-instaclone-userId');

  try {
    const data = await User.find({ _id: { $ne: id } })
      .sort({ posts: -1, followers: -1 })
      .limit(12);
    response.status(200).json({ data });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = feedRouter;
