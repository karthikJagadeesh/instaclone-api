const usersRouter = require('express').Router();
const bcrypt = require('bcrypt');
const ObjectId = require('mongoose').Types.ObjectId;

const User = require('../models/User');

const SALT_ROUNDS = 10;

usersRouter.get('/', async (_, response) => {
  const users = await User.find({}, '-password');
  const parsedUsers = await users.map(user => user.toJSON());
  response.json(parsedUsers);
});

usersRouter.get('/:id', async (request, response) => {
  const id = request.params.id;
  try {
    const result = await User.aggregate([
      { $match: { _id: ObjectId(id) } },
      {
        $addFields: {
          id: '$_id',
          followers: { $size: '$followersList' },
          following: { $size: '$followingList' }
        }
      },
      {
        $project: {
          _id: 0,
          __v: 0,
          followersList: 0,
          followingList: 0,
          password: 0
        }
      }
    ]).exec();
    const data = result[0];
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

usersRouter.put('/change/password/', async (request, response) => {
  const id = request.get('x-instaclone-userId');
  const { oldPassword, newPassword } = request.body;

  try {
    const user = await User.findById(id);
    const isCorrectPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isCorrectPassword) {
      return response.status(401).json({
        error:
          'Your old password was entered incorrectly. Please enter it again.'
      });
    }

    const samePassword = await bcrypt.compare(newPassword, user.password);
    if (samePassword) {
      return response.status(401).json({
        error: "Your new password can't be the same as old password"
      });
    }

    const hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const update = { password: hash };
    await user.update(update);
    response.status(200).json({ message: 'Password changed.' });
  } catch (error) {
    console.error(error);
    response.status(500).response({ error: 'Internal server error' });
  }
});

usersRouter.get('/:id/following', async (request, response) => {
  const id = request.params.id;
  const ownerId = request.get('x-instaclone-userId');

  try {
    const user = await User.findById(id);
    const followingList = user.followingList.map(id => ObjectId(id));
    const data = await User.aggregate([
      { $match: { _id: { $in: followingList } } },
      {
        $addFields: {
          id: '$_id',
          ownerIsFollowing: { $in: [ownerId, '$followersList'] },
          isFollowingOwner: { $in: [ownerId, '$followingList'] },
          isOwner: { $eq: ['$_id', ObjectId(ownerId)] }
        }
      },
      {
        $project: {
          id: 1,
          userName: 1,
          fullName: 1,
          profileImageUrl: 1,
          ownerIsFollowing: 1,
          isFollowingOwner: 1,
          isOwner: 1
        }
      }
    ]).exec();
    if (data.length > 0) {
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
    response.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = usersRouter;
