import { Component } from '@angular/core';

@Component({
  selector: 'app-options',
  standalone: false,
  templateUrl: './options.component.html',
  styleUrl: './options.component.css'
})
export class OptionsComponent {
 
  selectedColor: string = '#ffffff'; // Couleur par défaut
  colorPalette: string[] = [
    '#FF6900', '#FCB900', '#7BDCB5', '#00D084', 
    '#8ED1FC', '#0693E3', '#ABB8C3', '#EB144C'
  ]; // Palette personnalisée
}
