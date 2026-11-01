import mongoose from 'mongoose';

/** "Who changed what, when" — shown on the Activity screen. Kept for one year. */
const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, default: '' },
  action: { type: String, required: true }, // created, updated, deleted, uploaded, signed-in, …
  area: { type: String, default: '' }, // news, gallery, media, users, settings…
  areaLabel: { type: String, default: '' },
  itemId: { type: String, default: '' },
  itemTitle: { type: String, default: '' },
  at: { type: Date, default: Date.now },
}, { versionKey: false });

activitySchema.index({ at: -1 });
activitySchema.index({ at: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

export default mongoose.models.Activity || mongoose.model('Activity', activitySchema);
