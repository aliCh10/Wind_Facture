// src/app/models/Facture.ts
export interface FactureService {
  serviceName: string;
  serviceReference: string;
  servicePrice: number;
  quantity: number;
  tva: number;
  discount: number;
}

export interface Facture {
  id: number;
  factureNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  taxes: number;
  totalAmount: number;
  discountAmount: number;
  clientId: number;
  tenantId: number;
  clientName: string; 
  clientPhone: string; 
  clientAddress: string; 
  clientRIB: string; 
  
  factureServices: FactureService[];
  modeleFacture: any; // Consider defining a ModeleFacture interface
  createdAt: string;
  updatedAt: string;
  footerText: string; // Fixed typo from footerTexlet
}