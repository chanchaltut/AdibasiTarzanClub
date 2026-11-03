import mongoose from 'mongoose';

/**
 * One uploaded document (a PDF letter, invitation or calendar).
 * Photos live in Media; this is only for files the website offers to open or download.
 */
const fileSchema = new mongoose.Schema({
  storage: { type: String, enum: ['cloudinary', 'local'], required: true },
  publicId: { type: String, required: true },
  version: { type: Number, default: 1 },
  format: { type: String, default: 'pdf' },
  bytes: { type: Number, required: true },
  pages: { type: Number, default: 0 },
  /** Size of the first page, for the preview picture (Cloudinary only). */
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  originalName: { type: String, default: '', maxlength: 200 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.FileAsset || mongoose.model('FileAsset', fileSchema);
