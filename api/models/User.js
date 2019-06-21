const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: String,
  userName: String,
  email: String,
  sex: String
});

userSchema.set('toJSON', {
  transform: (_, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
  }
});

module.exports = mongoose.model('User', userSchema);
