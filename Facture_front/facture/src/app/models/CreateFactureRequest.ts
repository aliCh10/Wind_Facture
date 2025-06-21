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
  clientName: string;
  clientPhone: string; // Add clientPhone
  clientAddress: string; // Add clientAddress
  clientRIB: string; // Add clientRIB
  services: ServiceRequest[];
  creationDate: string;
  dueDate: string;
  footerText: string;
}