import type { Person } from 'src/pages/documents/types';

import axiosInstance, { endpoints } from './axios';

export const peopleApi = {
  search: (q: string) =>
    axiosInstance.get<Person[]>(endpoints.people.root, { params: { q } }),
  create: (data: Omit<Person, '_id'>) =>
    axiosInstance.post<Person>(endpoints.people.root, data),
};
