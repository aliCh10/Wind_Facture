import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-info-company',
  standalone: false,
  templateUrl: './info-company.component.html',
  styleUrls: ['./info-company.component.css']
})
export class InfoCompanyComponent {
  @ViewChild('companyContainer') companyContainer!: ElementRef<HTMLDivElement>;
  @Input() boundaryElement!: HTMLElement | ElementRef<HTMLElement>;

  position = { x: 20, y: 210 };
  companyInfo = {
    name: '',
    address: '',
    phone: '',
    email: '',
    siret: ''
  };

  onDragEnd(event: CdkDragEnd): void {
    // Obtenez l'élément HTMLElement réel si c'est un ElementRef
    const boundary = this.boundaryElement instanceof ElementRef 
      ? this.boundaryElement.nativeElement 
      : this.boundaryElement;

    const element = this.companyContainer.nativeElement;
    const container = boundary.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    let newX = this.position.x + event.distance.x;
    let newY = this.position.y + event.distance.y;

    this.position.x = Math.max(0, Math.min(newX, container.width - elementRect.width));
    this.position.y = Math.max(0, Math.min(newY, container.height - elementRect.height));

    event.source._dragRef.reset();
    event.source.setFreeDragPosition({ x: 0, y: 0 });
  }
}