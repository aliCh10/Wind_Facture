export class Service {
  constructor(
    public id: number,
    public ref: string,
    public serviceQuantity: number,
    public serviceName: string,
    public servicePrice: number,
    public tenantId?: number // Optional, included if backend returns it
  ) {}
}
export interface ServiceDTO {
  ref: string;
  serviceQuantity: number;
  serviceName: string;
  servicePrice: number;
}