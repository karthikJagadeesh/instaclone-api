const bcrypt = require('bcrypt');
const signupRouter = require('express').Router();

const User = require('../models/User');

const SALT_ROUNDS = 10;

signupRouter.post('/', async (request, response) => {
  try {
    const { userName, email, password } = request.body;

    const _email = await User.findOne({ email });
    if (_email) {
      return response.status(401).json({
        error: `Another account is using ${email}`
      });
    }

    const name = await User.findOne({ userName });
    if (name) {
      return response.status(401).json({
        error: "This username isn't available. Please try another."
      });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const model = { ...request.body, password: hash };
    const { fullName } = await User.create({ ...model });

    response
      .status(200)
      .json({ message: `Account successfully created for ${fullName}` });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = signupRouter;
