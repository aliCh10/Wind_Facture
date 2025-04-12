import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-calendar',
  standalone: false,
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent {

  @ViewChild('calendarContainer') calendarContainer!: ElementRef<HTMLDivElement>;
  @Input() boundaryElement?: HTMLElement;

  selectedDate1: Date | null = new Date(2025, 3, 10); // Default to 10/04/2025 (month is 0-based in JS)
  selectedOption: string = 'Facture'; // Default value for the first dropdown
  selectedPayment: string = 'à réception'; // Default value for the Règlement dropdown
  options: string[] = ['Facture', 'Devis', 'Bon de commande']; // Example options for Facture
  paymentOptions: string[] = ['à réception', '30 jours', '60 jours']; // Example opt
  position = { x: 20, y: 440 };

  onDragEnd(event: CdkDragEnd): void {
    if (!this.boundaryElement) return;

    const calendarElement = this.calendarContainer.nativeElement;
    const containerRect = this.boundaryElement.getBoundingClientRect();
    const calendarRect = calendarElement.getBoundingClientRect();

    // Calculate new position
    const newX = this.position.x + event.distance.x;
    const newY = this.position.y + event.distance.y;

    // Calculate boundaries
    const minX = 0;
    const minY = 0;
    const maxX = containerRect.width - calendarRect.width;
    const maxY = containerRect.height - calendarRect.height;

    // Apply constraints
    this.position.x = Math.max(minX, Math.min(newX, maxX));
    this.position.y = Math.max(minY, Math.min(newY, maxY));

    // Reset drag position
    event.source._dragRef.reset();
    event.source.setFreeDragPosition({ x: 0, y: 0 });
  }
}
