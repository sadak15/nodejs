import streamifier from 'streamifier';
import { cloudinary, isConfigured } from '../config/cloudinary.js';
import User from '../models/User.js';

function uploadBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'finance-tracker/avatars', resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export const uploadProfilePicture = async (req, res) => {
  if (!isConfigured()) return res.status(503).json({ message: 'File upload is not configured' });
  if (!req.file) return res.status(400).json({ message: 'Provide an image file in the "image" field' });
  const result = await uploadBuffer(req.file.buffer);
  const user = await User.findByIdAndUpdate(req.user._id, { avatarUrl: result.secure_url }, { new: true });
  res.json({ avatarUrl: user.avatarUrl });
};
