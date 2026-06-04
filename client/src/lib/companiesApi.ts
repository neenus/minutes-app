import type { Company } from 'src/pages/documents/types';

import axiosInstance, { endpoints } from './axios';

// Mongoose populate() replaces personId with the full Person object.
// We reshape it so the frontend sees { personId: string, person: Person } consistently.
function reshapePersonRef(item: any) {
  if (!item) return item;
  const pObj = item.personId;
  if (pObj && typeof pObj === 'object' && pObj._id) {
    return { ...item, person: pObj, personId: String(pObj._id) };
  }
  return item;
}

function reshapeCompany(raw: any): Company {
  return {
    ...raw,
    people: raw.people ?? [],
    shareholders: (raw.shareholders ?? []).map(reshapePersonRef),
    directors: (raw.directors ?? []).map(reshapePersonRef),
    officers: (raw.officers ?? []).map(reshapePersonRef),
    banking: {
      ...raw.banking,
      signatories: (raw.banking?.signatories ?? []).map(reshapePersonRef),
    },
    ledger: raw.ledger ?? [],
  };
}

export const companiesApi = {
  list: () => axiosInstance.get<Company[]>(endpoints.companies.root),
  get: (id: string) =>
    axiosInstance.get<Company>(endpoints.companies.byId(id)).then((r) => ({
      ...r, data: reshapeCompany(r.data),
    })),
  create: (data: Partial<Company>) =>
    axiosInstance.post<Company>(endpoints.companies.root, data).then((r) => ({
      ...r, data: reshapeCompany(r.data),
    })),
  update: (id: string, data: Partial<Company> & { _auditSummary?: string }) =>
    axiosInstance.put<Company>(endpoints.companies.byId(id), data).then((r) => ({
      ...r, data: reshapeCompany(r.data),
    })),
  remove: (id: string) => axiosInstance.delete(endpoints.companies.byId(id)),
};
