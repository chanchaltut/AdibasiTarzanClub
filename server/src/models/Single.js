import mongoose from 'mongoose';

/** One settings page (Club details, Page banners). Checked against schemas.js before saving. */
const singleSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, minimize: false });

export default mongoose.models.Single || mongoose.model('Single', singleSchema);
