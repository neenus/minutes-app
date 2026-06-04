import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { searchPeople, createPerson } from '../controllers/people.controller.js';

export const peopleRouter = Router();

peopleRouter.use(requireAuth);
peopleRouter.get('/', searchPeople);
peopleRouter.post('/', createPerson);
