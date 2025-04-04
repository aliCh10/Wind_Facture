// models/employee.ts
export interface Employee {
    id?: number;
    name: string;
    secondName: string;
    email: string;
    tel: string;
    post?: string;
    department?: string;
    partnerId?: number;
  }