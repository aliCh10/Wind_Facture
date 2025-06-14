// src/app/models/CreateFactureRequest.ts
export interface ServiceRequest {
  serviceId: number;
  serviceName: string;
  serviceReference: string;
  servicePrice: number;
  quantity: number;
  tva: number;
  discount: number;
}

export interface CreateFactureRequest {
  templateId: number;
  clientId: number;
  services: ServiceRequest[];
  
  creationDate: string;
  dueDate: string;
  footerText: string;
}