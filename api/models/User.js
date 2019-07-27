const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullName: String,
  userName: String,
  email: String,
  password: String,
  posts: {
    type: Number,
    default: 0
  },
  bio: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  followers: {
    type: Number,
    default: 0
  },
  followersList: {
    type: Array,
    default: []
  },
  following: {
    type: Number,
    default: 0
  },
  followingList: {
    type: Array,
    default: []
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  profileImageUrl: {
    type: String,
    default: ''
  }
});

userSchema.post('save', async function() {
  this.followers = this.followersList.length;
  this.following = this.followingList.length;
});

userSchema.set('toJSON', {
  transform: (_, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('User', userSchema);
