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
import { ToastrService } from 'ngx-toastr';

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
    private sectionDataCollector: SectionDataCollectorService,
    private toastr: ToastrService
  ) {}

  ngAfterViewInit() {
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
    // Assurez-vous que les positions sont bien capturées avant la sauvegarde
    this.sectionRegistry.forEach(section => {
        if (section && (section as any).getCurrentPosition) {
            const pos = (section as any).getCurrentPosition();
            section.x = pos.x;
            section.y = pos.y;
        }

    });

    const sections = this.sectionDataCollector.collectSectionData(this.sectionRegistry);
    const request: CreateModeleFactureRequest = {
        name: this.templateName,
        sections: sections.map(section => ({
            ...section,
            // Assurez-vous que les styles sont bien formatés
            styles: this.formatStylesForBackend(section.styles)
        }))
    };

    this.modeleFactureService.createModeleFacture(request).subscribe({
        next: (response) => {
            this.modeleFactureId = response.id ?? null;
            this.toastr.success('Modèle sauvegardé avec succès', 'Succès');
            console.log('Saved modele facture:', response);
        },
        error: (error) => {
            this.toastr.error('Erreur lors de la sauvegarde', 'Erreur');
        }
    });
}

private formatStylesForBackend(styles: {[key: string]: string}): {[key: string]: string} {
    const formattedStyles: {[key: string]: string} = {};
    for (const key in styles) {
        if (styles.hasOwnProperty(key)) {
            // Convertit les valeurs numériques sans unité en px
            if (/^\d+$/.test(styles[key])) {
                formattedStyles[key] = styles[key] + 'px';
            } else {
                formattedStyles[key] = styles[key];
            }
        }
    }
    return formattedStyles;
}

  loadModeleFacture(id: number) {
    this.modeleFactureService.getModeleFacture(id).subscribe({
        next: (modeleFacture) => {
            this.templateName = modeleFacture.nameModel;
            console.log('Loaded modele facture:', modeleFacture);

            modeleFacture.sections.forEach(section => {
                const component = this.sectionRegistry.find(c => c.sectionName === section.sectionName);
                if (component) {
                    component.id = section.id;
                    component.x = section.x;
                    component.y = section.y;
                    component.styles = section.styles || {};
                    component.content = section.content || { contentData: '' };
                    component.modeleFactureId = section.modeleFactureId;

                    this.styleManager.updateStyles(
                        section.sectionName,
                        section.styles || {},
                        'FactureComponent.loadModeleFacture'
                    );

                    if (typeof (component as any).applyContent === 'function' && section.content?.contentData) {
                        (component as any).applyContent(section.content.contentData);
                    }
                }
            });
        },
        error: (error) => console.error('Error loading template:', error)
    });
  }
}