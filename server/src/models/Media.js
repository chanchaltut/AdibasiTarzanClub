import mongoose from 'mongoose';

/** One uploaded photo. The file itself lives on Cloudinary; this is everything we know about it. */
const mediaSchema = new mongoose.Schema({
  storage: { type: String, enum: ['cloudinary', 'local'], required: true },
  publicId: { type: String, required: true },
  version: { type: Number, default: 1 },
  format: { type: String, default: 'webp' },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  bytes: { type: Number, required: true },
  originalBytes: { type: Number, default: 0 },
  originalName: { type: String, default: '', maxlength: 200 },
  /** Describes the photo for blind visitors and Google. */
  alt: { type: String, default: '', maxlength: 200 },
  lqip: { type: String, default: '' },
  color: { type: String, default: '' },
  hasAlpha: { type: Boolean, default: false },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

mediaSchema.index({ createdAt: -1 });
mediaSchema.index({ originalName: 'text', alt: 'text' });

export default mongoose.models.Media || mongoose.model('Media', mediaSchema);
