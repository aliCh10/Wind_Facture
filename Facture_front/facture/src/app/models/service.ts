// service.model.ts
export class Service {
  constructor(
    public id: number | null,  // Make id nullable for new creations
    public ref: string,
    public serviceName: string,
    public servicePrice: string | number  // Handle both string and number
  ) {}
}

export interface ServiceDTO {
  ref: string;
  serviceName: string;
  servicePrice: string;  // Send as string to match BigDecimal
}