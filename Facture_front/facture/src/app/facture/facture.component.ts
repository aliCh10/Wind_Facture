import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { LogoComponent } from '../components/Sections/logo/logo.component';

@Component({
  selector: 'app-facture',
  standalone:false,
  templateUrl: './facture.component.html',
  styleUrls: ['./facture.component.css']
})
export class FactureComponent implements AfterViewInit {
  @ViewChild('mainContent') mainContent!: ElementRef<HTMLDivElement>;
  @ViewChild(LogoComponent) logoComponent!: LogoComponent;
  showOptions = false;

  ngAfterViewInit() {
    this.logoComponent.containerRef = this.mainContent;
  }
  toggleOptions() {
    this.showOptions = !this.showOptions;
  }
  
  
}