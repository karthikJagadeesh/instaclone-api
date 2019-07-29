const friendRouter = require('express').Router();

const User = require('../models/User');

friendRouter.get('/:userName', async (request, response) => {
  const ownerId = request.get('x-instaclone-userId');
  const userName = request.params.userName;

  try {
    const result = await User.aggregate([
      { $match: { userName } },
      {
        $addFields: {
          ownerIsFollowing: { $in: [ownerId, '$followersList'] },
          isFollowingOwner: { $in: [ownerId, '$followingList'] },
          id: '$_id'
        }
      },
      {
        $project: {
          _id: 0,
          __v: 0,
          followersList: 0,
          followingList: 0,
          phoneNumber: 0,
          password: 0,
          email: 0
        }
      }
    ]).exec();

    const data = result[0];
    if (data) {
      response
        .status(200)
        .json({ status: 'ok', data })
        .end();
    } else {
      response
        .status(200)
        .json({ status: 'failed' })
        .end();
    }
  } catch (error) {
    console.error(error);
    response.status(404).json({ error: 'Unknown endpoint' });
  }
});

module.exports = friendRouter;
