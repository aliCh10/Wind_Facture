import { Section } from "./section.model";


export interface ModeleFacture {
    id?: number;
    nameModel: string;
    createdAt?: string; // ISO date string
    updatedAt?: string; // ISO date string
    sections: Section[];
}