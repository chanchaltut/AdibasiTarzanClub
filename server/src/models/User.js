import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200, unique: true },
  /** owner: everything, including adding people. editor: all content, no user management. */
  role: { type: String, enum: ['owner', 'editor'], default: 'editor' },
  passwordHash: { type: String, required: true, select: false },
  active: { type: Boolean, default: true },
  /** Bumped on password change / "sign out everywhere" — old sessions stop working. */
  sessionVersion: { type: Number, default: 0 },
  failedLogins: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null },
  lastLoginAt: { type: Date, default: null },
  mustChangePassword: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: String(this._id),
    name: this.name,
    email: this.email,
    role: this.role,
    active: this.active,
    lastLoginAt: this.lastLoginAt,
    mustChangePassword: this.mustChangePassword,
    createdAt: this.createdAt,
  };
};

export default mongoose.models.User || mongoose.model('User', userSchema);
