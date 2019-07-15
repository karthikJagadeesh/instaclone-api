const changeProfilePicRouter = require('express').Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const User = require('../models/User');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('profilePic');

async function handleProfilePicChange(request, response) {
  const id = request.params.id;

  if (!request.file) {
    return cloudinary.uploader.destroy(
      `profile_pics/${id}_profile_pic`,
      async error => {
        if (error) {
          throw new Error('Error deleting pic');
        }
        const update = { profileImageUrl: '' };
        const data = await User.findByIdAndUpdate(id, update, {
          select: '-password',
          new: true
        });
        return response
          .status(200)
          .json({ data, message: 'Profile photo removed.' });
      }
    );
  }

  const options = {
    width: 150,
    height: 150,
    crop: 'fill',
    folder: 'profile_pics/',
    public_id: `${id}_profile_pic`
  };

  cloudinary.uploader
    .upload_stream(options, async (error, image) => {
      if (error) {
        console.error(error);
        return response.status(500).json({ error: 'Error uploading image' });
      }
      const update = { profileImageUrl: image.secure_url };
      const data = await User.findByIdAndUpdate(id, update, {
        select: '-password',
        new: true
      });
      response.status(201).json({ data, message: 'Profile photo added.' });
    })
    .end(request.file.buffer);
}

changeProfilePicRouter.post('/:id', upload, handleProfilePicChange);

module.exports = changeProfilePicRouter;
