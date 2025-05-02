// import { Directive, ElementRef, Input, Output, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
// import { CdkDrag, CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
// import { Subscription } from 'rxjs';
// @Directive({
//     selector: '[appDraggable]',
//     standalone: true
//   })
//   export class DraggableDirective implements AfterViewInit, OnDestroy {
//     @Input() boundaryElement?: HTMLElement | ElementRef<HTMLElement>; // Accept HTMLElement or ElementRef
//     @Input() position: { x: number; y: number } = { x: 0, y: 0 };
//     @Output() positionChange = new EventEmitter<{ x: number; y: number }>();
//     @Output() dragMoved = new EventEmitter<{ x: number; y: number }>();
  
//     private dragOffset = { x: 0, y: 0 };
//     private subscriptions: Subscription = new Subscription();
  
//     constructor(
//       private el: ElementRef<HTMLElement>,
//       private cdkDrag: CdkDrag
//     ) {}
  
//     ngAfterViewInit() {
//       this.updatePosition();
//       this.setupCdkDrag();
//     }
  
//     ngOnDestroy() {
//       this.subscriptions.unsubscribe();
//     }
  
//     private setupCdkDrag() {
//       // Set boundary element directly
//       if (this.boundaryElement) {
//         const boundary = this.boundaryElement instanceof ElementRef
//           ? this.boundaryElement.nativeElement
//           : this.boundaryElement;
//         this.cdkDrag.boundaryElement = boundary;
//       }
  
//       this.subscriptions.add(
//         this.cdkDrag.moved.subscribe((event: CdkDragMove) => {
//           this.onDragMove(event);
//         })
//       );
  
//       this.subscriptions.add(
//         this.cdkDrag.ended.subscribe((event: CdkDragEnd) => {
//           this.onDragEnd(event);
//         })
//       );
//     }
  
//     private onDragMove(event: CdkDragMove) {
//       this.dragOffset = event.source.getFreeDragPosition();
//       const displayPosition = {
//         x: Math.round(this.position.x + this.dragOffset.x),
//         y: Math.round(this.position.y + this.dragOffset.y)
//       };
//       this.dragMoved.emit(displayPosition);
//     }
  
//     private onDragEnd(event: CdkDragEnd) {
//       let boundary: HTMLElement | null = null;
//       if (this.boundaryElement) {
//         boundary = this.boundaryElement instanceof ElementRef
//           ? this.boundaryElement.nativeElement
//           : this.boundaryElement;
//       }
  
//       const elementRect = this.el.nativeElement.getBoundingClientRect();
  
//       let newX = this.position.x + this.dragOffset.x;
//       let newY = this.position.y + this.dragOffset.y;
  
//       if (boundary) {
//         const boundaryRect = boundary.getBoundingClientRect();
//         newX = Math.max(0, Math.min(newX, boundaryRect.width - elementRect.width));
//         newY = Math.max(0, Math.min(newY, boundaryRect.height - elementRect.height));
//       }
  
//       this.position = { x: newX, y: newY };
//       this.dragOffset = { x: 0, y: 0 };
  
//       this.updatePosition();
  
//       event.source._dragRef.reset();
//       event.source.setFreeDragPosition({ x: 0, y: 0 });
  
//       this.positionChange.emit(this.position);
//     }
  
//     private updatePosition() {
//       this.el.nativeElement.style.position = 'absolute';
//       this.el.nativeElement.style.left = `${this.position.x}px`;
//       this.el.nativeElement.style.top = `${this.position.y}px`;
//     }
//   }