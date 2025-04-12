import { CdkDragDrop, CdkDragEnd, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, ViewChild, Input } from '@angular/core';

@Component({
  selector: 'app-info-client',
  standalone: false,
  templateUrl: './info-client.component.html',
  styleUrl: './info-client.component.css'
})
export class InfoClientComponent {
  
  @ViewChild('tableContainer') tableContainer!: ElementRef<HTMLDivElement>;
  @Input() boundaryElement?: HTMLElement;
  
  clients = [
    { 
      nom: '',
      telephone: '',
      adresse: '',
      rib: '' 
    }
  ];

  position = { x: 370, y: 210 };


  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.clients, event.previousIndex, event.currentIndex);
  }

  onDragEnd(event: CdkDragEnd) {
    if (!this.boundaryElement) return;

    const tableElement = this.tableContainer.nativeElement;
    const containerRect = this.boundaryElement.getBoundingClientRect();
    const tableRect = tableElement.getBoundingClientRect();

    // Calculer la nouvelle position
    const newX = this.position.x + event.distance.x;
    const newY = this.position.y + event.distance.y;

    // Calculer les limites
    const minX = 0;
    const minY = 0;
    const maxX = containerRect.width - tableRect.width;
    const maxY = containerRect.height - tableRect.height;

    // Appliquer les contraintes
    this.position.x = Math.max(minX, Math.min(newX, maxX));
    this.position.y = Math.max(minY, Math.min(newY, maxY));

    // Réinitialiser la position de drag
    event.source._dragRef.reset();
    event.source.setFreeDragPosition({ x: 0, y: 0 });
  }
}