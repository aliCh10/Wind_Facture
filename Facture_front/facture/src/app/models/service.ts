
export interface Service {
  id: number | null;
  ref: string;
  serviceName: string;
  servicePrice: string | number;
}

export interface ServiceDTO {
  ref: string;
  serviceName: string;
  servicePrice: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}