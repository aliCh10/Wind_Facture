import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { LogoComponent } from '../components/Sections/logo/logo.component';
import { CalendarComponent } from '../components/Sections/calendar/calendar.component';
import { OptionsComponent } from '../components/Sections/options/options.component';
import { TableComponent } from '../components/Sections/table/table.component';
import { InfoCompanyComponent } from '../components/Sections/info-company/info-company.component';
import { InfoClientComponent } from '../components/Sections/info-client/info-client.component';
import { FooterComponent } from '../components/Sections/footer/footer.component';
import { StyleManagerService } from '../services/StyleManagerService';
import { ModeleFactureService } from '../services/ModeleFactureService';
import { Section } from '../models/section.model';
import { SectionDataCollectorService } from '../services/section-data-collector.service';
import { CreateModeleFactureRequest } from '../models/create-modele-facture-request.model';

@Component({
  selector: 'app-facture',
  standalone: false,
  templateUrl: './facture.component.html',
  styleUrls: ['./facture.component.css']
})
export class FactureComponent implements AfterViewInit {
  @ViewChild('mainContent') mainContent!: ElementRef<HTMLDivElement>;
  @ViewChild('a4Page') a4Page!: ElementRef<HTMLDivElement>;
  @ViewChild(OptionsComponent) optionsComponent!: OptionsComponent;
  @ViewChild(LogoComponent) logoComponent!: LogoComponent;
  @ViewChild(TableComponent) tableComponent!: TableComponent;
  @ViewChild(CalendarComponent) calendarComponent!: CalendarComponent;
  @ViewChild(InfoCompanyComponent) infoCompanyComponent!: InfoCompanyComponent;
  @ViewChild(InfoClientComponent) infoClientComponent!: InfoClientComponent;
  @ViewChild(FooterComponent) footerComponent!: FooterComponent;

  showOptions = false;
  modeleFactureId: number | null = null;
  templateName = 'Default Template';
  activeComponent: string = '';
  private sectionRegistry: Section[] = [];

  constructor(
    private styleManager: StyleManagerService,
    private modeleFactureService: ModeleFactureService,
    private sectionDataCollector: SectionDataCollectorService
  ) {}

  ngAfterViewInit() {
    // Register all section components
    this.sectionRegistry = [
      this.logoComponent,
      this.tableComponent,
      this.calendarComponent,
      this.infoCompanyComponent,
      this.infoClientComponent,
      this.footerComponent
    ].filter(component => !!component);

    this.sectionRegistry.forEach(component => {
      if (component) {
        (component as any).containerRef = this.mainContent;
        (component as any).boundaryElement = this.a4Page.nativeElement;
      }
    });

    if (this.modeleFactureId) {
      this.loadModeleFacture(this.modeleFactureId);
    }
  }

  onOpenOptions(componentName: string) {
    this.activeComponent = componentName;
    this.showOptions = true;
  }

  toggleOptions() {
    this.showOptions = !this.showOptions;
    if (!this.showOptions) {
      this.activeComponent = '';
    }
  }

  onStylesUpdated(event: { component: string, styles: any }) {
    this.styleManager.updateStyles(event.component, event.styles, 'FactureComponent');
  }

  saveModeleFacture() {
    const sections = this.sectionDataCollector.collectSectionData(this.sectionRegistry);
    
    const request: CreateModeleFactureRequest = {
        name: this.templateName,
        sections: sections
    };

    this.modeleFactureService.createModeleFacture(request).subscribe({
        next: (response) => {
            console.log('Template saved successfully', response);
            this.modeleFactureId = response.id ?? null;
            
            // Mettre à jour les IDs des sections si nécessaire
            if (response.sections) {
                response.sections.forEach((savedSection, index) => {
                    if (this.sectionRegistry[index]) {
                        this.sectionRegistry[index].id = savedSection.id;
                    }
                });
            }
        },
        error: (error) => console.error('Error saving template', error)
    });
}

loadModeleFacture(id: number) {
    this.modeleFactureService.getModeleFacture(id).subscribe({
        next: (modeleFacture) => {
            this.templateName = modeleFacture.nameModel;
            
            modeleFacture.sections.forEach(section => {
                const component = this.sectionRegistry.find(c => c.sectionName === section.sectionName);
                if (component) {
                    // Mise à jour des propriétés
                    component.id = section.id;
                    component.x = section.x;
                    component.y = section.y;
                    component.styles = section.styles || {};
                    component.modeleFactureId = section.modeleFactureId;
                                     
                    
                    this.styleManager.updateStyles(
                        section.sectionName, 
                        section.styles || {}, 
                        'FactureComponent.loadModeleFacture'
                    );
                }
            });
        },
        error: (error) => console.error('Error loading template', error)
    });
}
}