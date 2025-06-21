// src/app/models/client.ts
export interface Client {
  id?: number;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  rib: string;
  tenantId?: number;
}

export interface Page<T> {
  content: T[];
  pageable: {
    sort: { sorted: boolean; unsorted: boolean; empty: boolean };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}