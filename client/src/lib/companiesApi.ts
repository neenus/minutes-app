import type { Company } from 'src/pages/documents/types';

import axiosInstance, { endpoints } from './axios';

export const companiesApi = {
  list: () => axiosInstance.get<Company[]>(endpoints.companies.root),
  get: (id: string) => axiosInstance.get<Company>(endpoints.companies.byId(id)),
  create: (data: Partial<Company>) => axiosInstance.post<Company>(endpoints.companies.root, data),
  update: (id: string, data: Partial<Company> & { _auditSummary?: string }) =>
    axiosInstance.put<Company>(endpoints.companies.byId(id), data),
  remove: (id: string) => axiosInstance.delete(endpoints.companies.byId(id)),
};
