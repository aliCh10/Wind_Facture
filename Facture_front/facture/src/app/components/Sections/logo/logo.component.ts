import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-logo',
  standalone: false,
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.css'
})
export class LogoComponent {
  @ViewChild('logoContainer') logoContainer!: ElementRef<HTMLDivElement>;
  @Input() containerRef!: ElementRef<HTMLDivElement>;
  @Output() positionChanged = new EventEmitter<{ x: number, y: number }>();
  
  imageUrl: string | null = null;
  position = { x: 20, y: 20 };
  dragOffset = { x: 0, y: 0 }; // Renommé de currentDrag à dragOffset pour plus de clarté
  showPosition = false;
  constructor(
    private translate : TranslateService
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.match('image.*')) {
        alert('Seules les images sont acceptées');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result as string;
        this.showPosition = true;
      };
      reader.readAsDataURL(file);
    }
  }

  onDragMove(event: CdkDragMove): void {
    // Capture le déplacement relatif
    this.dragOffset = event.source.getFreeDragPosition();
  }

  onDragEnd(event: CdkDragEnd): void {
    const logoElement = this.logoContainer.nativeElement;
    const containerElement = this.containerRef.nativeElement;

    // Calculer la nouvelle position absolue
    let newX = this.position.x + this.dragOffset.x;
    let newY = this.position.y + this.dragOffset.y;

    // Obtenir les dimensions
    const logoRect = logoElement.getBoundingClientRect();
    const containerRect = containerElement.getBoundingClientRect();

    // Calculer les limites
    const minX = 0;
    const minY = 0;
    const maxX = containerRect.width - logoRect.width;
    const maxY = containerRect.height - logoRect.height;

    // Appliquer les contraintes
    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    // Mettre à jour la position
    this.position = { x: newX, y: newY };
    this.dragOffset = { x: 0, y: 0 }; // Réinitialiser le déplacement

    // Réinitialiser la transformation de drag
    event.source._dragRef.reset();
    event.source.setFreeDragPosition({ x: 0, y: 0 });

    // Émettre la nouvelle position
    this.positionChanged.emit(this.position);
  }

  getCurrentPosition() {
    return {
      x: this.position.x + this.dragOffset.x,
      y: this.position.y + this.dragOffset.y
    };
  }
}
