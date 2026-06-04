import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Person } from '../models/Person.js';

function errorStatus(err: unknown): number {
  if (err instanceof mongoose.Error.ValidationError) return 400;
  if (err instanceof mongoose.Error.CastError) return 400;
  return 500;
}

export async function searchPeople(req: Request, res: Response) {
  try {
    const q = (req.query.q as string) || '';
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    const people = await Person.find({ name: regex }).limit(20).lean();
    res.json(people);
  } catch (err) {
    res.status(500).json({ error: 'Failed to search people' });
  }
}

export async function createPerson(req: Request, res: Response) {
  try {
    const { name, streetAddress, city, province, postalCode } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
    const person = await Person.create({ name, streetAddress, city, province, postalCode });
    res.status(201).json(person);
  } catch (err) {
    res.status(errorStatus(err)).json({ error: 'Failed to create person' });
  }
}
