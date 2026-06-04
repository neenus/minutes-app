import type { Request, Response } from 'express';
import { Person } from '../models/Person.js';

export async function searchPeople(req: Request, res: Response) {
  try {
    const q = (req.query.q as string) || '';
    const regex = new RegExp(q, 'i');
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
    res.status(500).json({ error: 'Failed to create person' });
  }
}
