const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();

const User = require('../models/User');

loginRouter.post('/', async (request, response) => {
  const { userName, password } = request.body;

  const user = await User.findOne({ userName });
  if (!user) {
    return response.status(401).json({
      error:
        "The username you entered doesn't belong to an account. Please check your username and try again."
    });
  }

  const isCorrectPassword = await bcrypt.compare(password, user.password);
  if (!isCorrectPassword) {
    return response.status(401).json({
      error:
        'Sorry, your password was incorrect. Please double-check your password.'
    });
  }

  const payload = {
    userName: user.userName,
    id: user.id
  };
  const token = jwt.sign(payload, process.env.SECRET);

  response.status(200).send({
    token,
    userInfo: {
      userName: user.userName,
      id: user.id
    },
    message: `Welcome ${user.fullName}`
  });
});

module.exports = loginRouter;
