const feedRouter = require('express').Router();
const ObjectId = require('mongoose').Types.ObjectId;

const User = require('../models/User');

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
      { $addFields: { following: false, id: '$_id' } },
      { $project: { _id: 0 } },
      { $limit: 12 }
    ]).exec();
    response.status(200).json({ data });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = feedRouter;
