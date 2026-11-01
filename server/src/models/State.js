import mongoose from 'mongoose';

/** Small bits of server memory that must survive a restart (e.g. "the website needs refreshing"). */
const stateSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true, minimize: false });

export default mongoose.models.State || mongoose.model('State', stateSchema);
