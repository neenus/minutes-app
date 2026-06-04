import { Schema, model } from 'mongoose';

const PersonSchema = new Schema({
  name: { type: String, required: true },
  streetAddress: { type: String, default: '' },
  city: { type: String, default: '' },
  province: { type: String, default: '' },
  postalCode: { type: String, default: '' },
});

export const Person = model('Person', PersonSchema);
