const friendRouter = require('express').Router();

const User = require('../models/User');

friendRouter.get('/:userName', async (request, response) => {
  const userName = request.params.userName;

  try {
    const data = await User.findOne({ userName });
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
