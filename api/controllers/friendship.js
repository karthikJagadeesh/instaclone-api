const friendshipRouter = require('express').Router();

const User = require('../models/User');

friendshipRouter.post('/:id', async (request, response) => {
  const ownerId = request.get('x-instaclone-userId');
  const friendId = request.params.id;
  const follow = request.body.follow;

  try {
    const owner = await User.findById(ownerId);
    const friend = await User.findById(friendId);

    if (follow) {
      const ownerUpdater = {
        followingList: [...owner.followingList, friendId]
      };
      await owner.update(ownerUpdater);

      const friendUpdater = {
        followersList: [...friend.followersList, ownerId]
      };
      await friend.update(friendUpdater);
      response
        .status(200)
        .json({ status: 'ok', ownerIsFollowing: true })
        .end();
    }

    if (!follow) {
      const updatedFollowingList = removeItem({
        list: owner.followingList,
        item: friendId
      });
      const ownerUpdater = { followingList: updatedFollowingList };
      await owner.update(ownerUpdater);

      const updatedFollowersList = removeItem({
        list: friend.followersList,
        item: ownerId
      });
      const friendUpdater = { followersList: updatedFollowersList };
      await friend.update(friendUpdater);

      response
        .status(200)
        .json({ status: 'ok', ownerIsFollowing: false })
        .end();
    }
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

function removeItem({ list, item }) {
  const index = list.findIndex(listItem => listItem === item);
  if (index > -1) {
    const updatedList = [...list.slice(0, index), ...list.slice(index + 1)];
    return updatedList;
  }
  return list;
}

module.exports = friendshipRouter;
