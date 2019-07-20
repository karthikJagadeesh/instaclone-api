const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const Schema = mongoose.Schema;

const postSchema = new Schema({
  _id: ObjectId,
  caption: String,
  imageUrl: String,
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  owner: {
    id: String,
    profileImageUrl: String,
    userName: String
  },
  postedAt: Date
});

postSchema.set('toJSON', {
  transform: (_, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Post', postSchema);
