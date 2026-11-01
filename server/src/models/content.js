// One MongoDB collection per entry in schemas.js COLLECTIONS, built from the field list.

import mongoose from 'mongoose';
import { COLLECTIONS } from '../content/schemas.js';

const { Schema } = mongoose;

const imageSchema = new Schema({
  media: { type: Schema.Types.ObjectId, ref: 'Media' },
  /** A photo shipped with the website (e.g. /photos/hero.webp), used until one is uploaded. */
  src: String,
  alt: String,
  crop: { x: Number, y: Number, w: Number, h: Number },
  focal: { x: Number, y: Number },
}, { _id: false });

function typeFor(f) {
  switch (f.type) {
    case 'number': return { type: Number };
    case 'boolean': return { type: Boolean, default: f.default ?? false };
    case 'datetime': return { type: Date };
    case 'image': return { type: imageSchema, default: undefined };
    case 'ref': return { type: Schema.Types.ObjectId, ref: modelName(f.to) };
    case 'list':
      return f.of === 'text'
        ? { type: [String], default: undefined }
        : { type: [new Schema(shape(f.fields), { _id: false })], default: undefined };
    default: return { type: String };
  }
}

function shape(fields) {
  const out = {};
  for (const f of fields) if (f.type !== 'heading') out[f.name] = typeFor(f);
  return out;
}

export const modelName = (key) => `C_${key}`;

const models = {};
for (const def of COLLECTIONS) {
  const schema = new Schema({
    ...shape(def.fields),
    order: { type: Number, default: 0 },
    /** Built-in items the site depends on (e.g. our own club in Teams) can't be deleted. */
    locked: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  }, { timestamps: true, collection: `content_${def.key}`, minimize: false });

  schema.index({ order: 1 });
  if (def.fields.some((f) => f.name === 'date')) schema.index({ date: -1 });
  if (def.fields.some((f) => f.type === 'slug')) schema.index({ slug: 1 }, { unique: true, partialFilterExpression: { slug: { $type: 'string' } } });

  models[def.key] = mongoose.models[modelName(def.key)] || mongoose.model(modelName(def.key), schema);
}

export function contentModel(key) {
  return models[key] || null;
}

export default models;
