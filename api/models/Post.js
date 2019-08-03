const mongoose = require('mongoose');

const User = require('./User');

const ObjectId = mongoose.Types.ObjectId;
const Schema = mongoose.Schema;

const postSchema = new Schema({
  _id: ObjectId,
  caption: String,
  imageUrl: String,
  likesList: {
    type: Array,
    default: []
  },
  commentsList: {
    type: Array,
    default: []
  },
  owner: {
    id: String,
    profileImageUrl: String,
    userName: String
  },
  postedAt: Date,
  updatedAt: Date
});

postSchema.pre('save', async function() {
  const now = new Date();
  if (!this.postedAt) {
    this.postedAt = now;
    const user = await User.findById(this.owner.id);
    await user.update({ posts: user.posts + 1 });
  }
  this.updatedAt = now;
});

postSchema.post('remove', async function() {
  const user = await User.findById(this.owner.id);
  user.update({ posts: user.posts - 1 });
});

postSchema.set('toJSON', {
  transform: (_, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Post', postSchema);
