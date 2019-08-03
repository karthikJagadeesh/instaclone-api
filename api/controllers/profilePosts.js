const profilePostsRouter = require('express').Router();

const Post = require('../models/Post');

profilePostsRouter.get('/:id', async (request, response) => {
  const id = request.params.id;

  try {
    const data = await Post.aggregate([
      { $match: { 'owner.id': id } },
      {
        $addFields: {
          id: '$_id',
          likes: { $size: '$likesList' },
          comments: { $size: '$commentsList' }
        }
      },
      {
        $project: {
          _id: 0,
          __v: 0,
          likesList: 0,
          commentsList: 0
        }
      },
      { $sort: { postedAt: -1 } }
    ]);
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
