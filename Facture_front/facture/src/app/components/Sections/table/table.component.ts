import { CdkDragDrop, CdkDragEnd, CdkDragMove, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
interface TableItem {
  ref: string;
  tva: number;
  remise: number;
  quantity: number;
  price: number;
}
@Component({
  selector: 'app-table',
  standalone: false,
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  @ViewChild('tableContainer') tableContainer!: ElementRef<HTMLDivElement>;
  @Input() containerRef!: ElementRef<HTMLDivElement>;
  @Input() boundaryElement!: HTMLElement | ElementRef<HTMLElement>;

  @Output() positionChanged = new EventEmitter<{ x: number, y: number }>();
  hoveredIndex: number | null = null;

  items: TableItem[] = [
    { ref: '', tva: 20, remise: 0, quantity: 1, price: 0 }
  ];
  
  position = { x: 20, y: 540 };
  dragOffset = { x: 0, y: 0 };
  showPosition = true;

  addItem(): void {
    this.items.push({ ref: '', tva: 20, remise: 0, quantity: 1, price: 0 });
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.splice(index, 1);
    }
  }

  calculateLineTotal(item: TableItem): number {
    const montantHT = item.quantity * item.price;
    const montantRemise = montantHT * (item.remise / 100);
    const montantTVA = (montantHT - montantRemise) * (item.tva / 100);
    return montantHT - montantRemise + montantTVA;
  }

  calculateTotal(): number {
    return this.items.reduce((total, item) => total + this.calculateLineTotal(item), 0);
  }

  onDragMove(event: CdkDragMove): void {
    this.dragOffset = event.source.getFreeDragPosition();
  }

  onDragEnd(event: CdkDragEnd): void {
    const tableElement = this.tableContainer.nativeElement;
    const containerElement = this.containerRef.nativeElement;

    let newX = this.position.x + this.dragOffset.x;
    let newY = this.position.y + this.dragOffset.y;

    const tableRect = tableElement.getBoundingClientRect();
    const containerRect = containerElement.getBoundingClientRect();

    const minX = 0;
    const minY = 0;
    const maxX = containerRect.width - tableRect.width;
    const maxY = containerRect.height - tableRect.height;

    newX = Math.max(minX, Math.min(newX, maxX));
    newY = Math.max(minY, Math.min(newY, maxY));

    this.position = { x: newX, y: newY };
    this.dragOffset = { x: 0, y: 0 };

    event.source._dragRef.reset();
    event.source.setFreeDragPosition({ x: 0, y: 0 });

    this.positionChanged.emit(this.position);
  }



}
