const profilePostsRouter = require('express').Router();

const Post = require('../models/Post');

profilePostsRouter.get('/', async (request, response) => {
  const id = request.get('x-instaclone-userId');

  try {
    const data = await Post.find({ 'owner.id': id }).sort({ postedAt: -1 });
    response
      .status(200)
      .json({ data })
      .end();
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .json({ error: 'Internal server error' })
      .end();
  }
});

module.exports = profilePostsRouter;
