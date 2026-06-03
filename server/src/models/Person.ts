import { Schema, model } from 'mongoose';

const PersonSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String },
});

export const Person = model('Person', PersonSchema);
