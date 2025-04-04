import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone',
  standalone: false
})
export class PhonePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Nettoyage : suppression des espaces, tirets, ou autres caractères non numériques
    const cleanedValue = value.replace(/\D/g, '');

    if (cleanedValue.length === 8) {
      // Format pour un numéro de 8 chiffres : XX XXX XXX
      return `${cleanedValue.substring(0, 2)} ${cleanedValue.substring(2, 5)} ${cleanedValue.substring(5, 8)}`;
    } 
    
    if (cleanedValue.length > 8) {
      // Format pour un numéro avec indicatif international
      const countryCode = `+${cleanedValue.substring(0, cleanedValue.length - 8)} `;
      const firstPart = cleanedValue.substring(cleanedValue.length - 8, cleanedValue.length - 6);
      const secondPart = cleanedValue.substring(cleanedValue.length - 6, cleanedValue.length - 3);
      const thirdPart = cleanedValue.substring(cleanedValue.length - 3);

      return `${countryCode}${firstPart} ${secondPart} ${thirdPart}`;
    }

    return value; // Retourner tel quel si format inconnu
  }
}
