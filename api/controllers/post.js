const postRouter = require('express').Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const sizeOf = require('buffer-image-size');
const ObjectId = require('mongoose').Types.ObjectId;

const Post = require('../models/Post');
const User = require('../models/User');

const storage = multer.memoryStorage();
const upload = multer({ storage }).any();

async function handlePostRoute(request, response) {
  const id = request.get('x-instaclone-userId');
  const {
    body: { caption, imageCropOptions },
    files
  } = request;

  try {
    const { userName, profileImageUrl } = await User.findById(id);
    const _imageCropOptions = JSON.parse(imageCropOptions);

    const imageDimentions = sizeOf(files[0].buffer);
    const ratio = imageDimentions.width / _imageCropOptions.realImageWidth;
    const scaledToRatio = value => Math.floor(value * ratio);

    const DB_ID = new ObjectId();

    const options = {
      dpr: 'auto',
      client_hints: true,
      folder: `posts/_${id}_`,
      public_id: `_${DB_ID}_`,
      width: scaledToRatio(_imageCropOptions.width),
      height: scaledToRatio(_imageCropOptions.height),
      x: scaledToRatio(_imageCropOptions.x),
      y: scaledToRatio(_imageCropOptions.y),
      crop: 'crop'
    };

    cloudinary.uploader
      .upload_stream(options, async (error, image) => {
        if (error) {
          console.error(error);
          response
            .status(500)
            .json({ error: 'Error uploading image' })
            .end();
        }

        const model = {
          _id: DB_ID,
          imageUrl: image.secure_url,
          caption,
          owner: {
            id,
            userName,
            profileImageUrl
          },
          postedAt: new Date()
        };
        await Post.create(model);
        response.status(201).json({ message: 'Post shared.' });
      })
      .end(files[0].buffer);
  } catch (error) {
    console.error(error);
    response
      .status(500)
      .json({ error: 'Internal server error' })
      .end();
  }
}

postRouter.post('/', upload, handlePostRoute);

module.exports = postRouter;
