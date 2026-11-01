import mongoose from 'mongoose';

/** Hindi and Bengali for one English sentence of website content. The English is the key. */
const translationSchema = new mongoose.Schema({
  en: { type: String, required: true, unique: true, maxlength: 20000 },
  hi: { type: String, default: '', maxlength: 20000 },
  bn: { type: String, default: '', maxlength: 20000 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.models.Translation || mongoose.model('Translation', translationSchema);
