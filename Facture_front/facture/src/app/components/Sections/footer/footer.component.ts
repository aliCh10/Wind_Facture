import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: false,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  @ViewChild('footerContainer') footerContainer!: ElementRef<HTMLDivElement>;
  @Input() containerRef!: ElementRef<HTMLDivElement>; 
  @Output() positionChanged = new EventEmitter<{ x: number, y: number }>();

  position = { x: 20, y: 950 }; 




  onDragEnd(event: CdkDragEnd): void {
    const footerElement = this.footerContainer.nativeElement;
    const containerElement = this.containerRef.nativeElement;

 
    // Get dimensions
    const footerRect = footerElement.getBoundingClientRect();
    const containerRect = containerElement.getBoundingClientRect();

  
    event.source._dragRef.reset();
    event.source.setFreeDragPosition({ x: 0, y: 0 });

    // Emit new position
    this.positionChanged.emit(this.position);

  }

  onEditFooter(): void {
    console.log('Edit footer clicked');
  }

 
}
