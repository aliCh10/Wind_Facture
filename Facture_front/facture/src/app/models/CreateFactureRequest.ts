export interface ServiceRequest {
  serviceId: number;
  servicePrice: number;
  quantity: number;
  tva: number;
  discount: number;
}

export interface CreateFactureRequest {
  templateId: number;
  clientId: number;
  services: ServiceRequest[]; // List of services
  creationDate: string;
  dueDate: string;
}