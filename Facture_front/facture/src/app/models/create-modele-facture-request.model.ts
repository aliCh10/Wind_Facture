import { Section } from './section.model';

export interface CreateModeleFactureRequest {
  name: string;
  sections: Section[];
}