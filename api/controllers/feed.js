const feedRouter = require('express').Router();
const ObjectId = require('mongoose').Types.ObjectId;

const User = require('../models/User');
const Post = require('../models/Post');

feedRouter.get('/suggestions', async (request, response) => {
  const id = request.get('x-instaclone-userId');

  try {
    const data = await User.aggregate([
      {
        $match: {
          _id: { $ne: ObjectId(id) },
          followersList: { $nin: [id] },
          posts: { $gt: 0 }
        }
      },
      { $sort: { posts: -1, followers: -1 } },
      { $project: { fullName: 1, userName: 1, profileImageUrl: 1 } },
      { $addFields: { ownerIsFollowing: false, id: '$_id' } },
      { $project: { _id: 0 } },
      { $limit: 12 }
    ]).exec();
    response.status(200).json({ data });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

feedRouter.get('/', async (request, response) => {
  const id = request.get('x-instaclone-userId');

  try {
    const { followingList } = await User.findById(id);
    const data = await Post.aggregate([
      {
        $match: { 'owner.id': { $in: [id, ...followingList] } }
      },
      { $sort: { postedAt: -1 } },
      {
        $addFields: {
          id: '$_id',
          likes: { $size: '$likesList' },
          comments: { $size: '$commentsList' },
          ownerHasLiked: { $in: [id, '$likesList'] }
        }
      },
      { $project: { _id: 0, __v: 0, likesList: 0, commentsList: 0 } },
      { $limit: 5 }
    ]).exec();
    response.status(200).json({ data });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal server code' });
  }
});

module.exports = feedRouter;
