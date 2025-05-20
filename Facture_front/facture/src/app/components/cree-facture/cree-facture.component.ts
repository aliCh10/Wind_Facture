import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { DynamicModalComponent } from '../dynamic-modal/dynamic-modal.component';
import { ModeleFacture } from '../../models/modele-facture.model';
import { ModeleFactureService } from '../../services/ModeleFactureService';
import { ClientService } from '../../services/ClientService';
import { Client } from '../../models/Client';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Service } from '../../models/service';
import { SerService } from '../../services/ser.service';
import { AuthService } from '../../services/AuthService';

@Component({
  selector: 'app-cree-facture',
  standalone: false,
  templateUrl: './cree-facture.component.html',
  styleUrls: ['./cree-facture.component.css'],
})
export class CreeFactureComponent implements OnInit {
  clientForm: FormGroup;
  servicesForm: FormGroup;
  datesForm: FormGroup;
  modeles: ModeleFacture[] = [];
  clients: Client[] = [];
  services: Service[] = [];
  loading = false;
  selectedModele: ModeleFacture | null = null;
  thumbnailUrls: { [key: number]: SafeUrl | string } = {};

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private modeleFactureService: ModeleFactureService,
    private clientService: ClientService,
    private serService: SerService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {
    this.clientForm = this.fb.group({
      selectedClient: [null, Validators.required],
      selectedModele: [null, Validators.required],
      clientName: ['', Validators.required],
      clientPhone: ['', [Validators.required, Validators.pattern(/^\+?\d{8,15}$/)]],
      clientAddress: ['', Validators.required],
      clientRIB: ['', [Validators.required]],
      companyName: ['', Validators.required],
      companyAddress: ['', Validators.required],
      companyType: ['', Validators.required],
      companyLogo: ['', Validators.required]
    });

    this.servicesForm = this.fb.group({
      selectedService: [null, Validators.required],
      serviceReference: ['', Validators.required],
      serviceName: ['', Validators.required],
      servicePrice: [0, [Validators.required, Validators.min(0)]]
    });

    this.datesForm = this.fb.group({
      creationDate: [new Date().toISOString().split('T')[0], Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadModeles();
    this.loadClients();
    this.loadServices();
    this.loadCompanyInfo();
  }

  loadCompanyInfo(): void {
    this.loading = true;
    this.authService.getCompanyInfo().subscribe({
      next: (companyInfo) => {
        this.clientForm.patchValue({
          companyName: companyInfo.companyName || '',
          companyAddress: companyInfo.address || '',
          companyType: companyInfo.companyType || '',
          companyLogo: companyInfo.logoUrl || ''
        });
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        let errorMessage = this.translate.instant('DYNAMIC_MODAL.ERROR.FETCH_FAILED');
        if (error.status === 401) {
          errorMessage = this.translate.instant('AUTH.ERROR.INVALID_TOKEN');
        } else if (error.status === 403) {
          errorMessage = this.translate.instant('AUTH.ERROR.FORBIDDEN');
        } else if (error.status === 404) {
          errorMessage = this.translate.instant('AUTH.ERROR.PARTNER_NOT_FOUND');
        }
        this.toastr.error(errorMessage, this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE'));
        console.error('Failed to load company info:', error);
        // Set companyLogo to empty string on error to trigger fallback UI
        this.clientForm.patchValue({ companyLogo: '' });
      }
    });
  }

  // Handle image loading errors
  handleLogoError(): void {
    console.warn('Failed to load company logo');
    this.toastr.warning(
      this.translate.instant('CREATE_INVOICE.ERRORS.LOGO_LOAD_FAILED'),
      this.translate.instant('DYNAMIC_MODAL.WARNING.TITLE')
    );
    this.clientForm.patchValue({ companyLogo: '' });
  }

  get clientStepControls() {
    return this.fb.group({
      selectedClient: this.clientForm.get('selectedClient'),
      selectedModele: this.clientForm.get('selectedModele')
    });
  }

  get companyStepControls() {
    return this.fb.group({
      companyName: this.clientForm.get('companyName'),
      companyAddress: this.clientForm.get('companyAddress'),
      companyType: this.clientForm.get('companyType'),
      companyLogo: this.clientForm.get('companyLogo')
    });
  }

  get servicesStepControls() {
    return this.fb.group({
      selectedService: this.servicesForm.get('selectedService'),
      serviceReference: this.servicesForm.get('serviceReference'),
      serviceName: this.servicesForm.get('serviceName'),
      servicePrice: this.servicesForm.get('servicePrice')
    });
  }

  loadClients(): void {
    this.loading = true;
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.loading = false;
      },
      error: (error) => {
        console.error(this.translate.instant('DYNAMIC_MODAL.CLIENT.ERROR.FETCH_FAILED'), error);
        this.toastr.error(
          this.translate.instant('DYNAMIC_MODAL.CLIENT.ERROR.FETCH_FAILED'),
          this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
        );
        this.loading = false;
      }
    });
  }

  loadServices(): void {
    this.loading = true;
    this.serService.getAllServices().subscribe({
      next: (services) => {
        this.services = services;
        this.loading = false;
      },
      error: (error) => {
        console.error(this.translate.instant('SERVICES_PAGE.ERROR.LOAD_FAILED'), error);
        this.toastr.error(
          this.translate.instant('SERVICES_PAGE.ERROR.LOAD_FAILED'),
          this.translate.instant('SERVICES_PAGE.ERROR.TITLE')
        );
        this.loading = false;
      }
    });
  }

  loadModeles(): void {
    this.loading = true;
    this.modeleFactureService.getAllModelesFacture().subscribe({
      next: (modeles) => {
        this.modeles = modeles;
        this.modeles.forEach(modele => {
          if (modele.id) {
            this.loadThumbnail(modele.id);
          }
        });
        this.loading = false;
      },
      error: (error) => {
        console.error(this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_LOAD_TEMPLATES.TEXT'), error);
        this.loading = false;
        this.toastr.error(
          this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_LOAD_TEMPLATES.TEXT'),
          this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_LOAD_TEMPLATES.TITLE')
        );
      }
    });
  }

  loadThumbnail(id: number): void {
    this.modeleFactureService.getModeleThumbnail(id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.thumbnailUrls[id] = this.sanitizer.bypassSecurityTrustUrl(url);
      },
      error: (error) => {
        console.error(`Failed to load thumbnail for modele ${id}:`, error);
        this.thumbnailUrls[id] = '';
      }
    });
  }

  getThumbnailUrl(modele: ModeleFacture): SafeUrl | string {
    return modele.id && this.thumbnailUrls[modele.id] ? this.thumbnailUrls[modele.id] : '';
  }

  handleImageError(event: Event, modele: ModeleFacture): void {
    console.warn(`Failed to load thumbnail for modele ${modele.id}`);
    if (modele.id) {
      this.thumbnailUrls[modele.id] = '';
    }
  }

  onClientChange(client: Client): void {
    const clientData = {
      clientName: client.clientName || '',
      clientPhone: client.clientPhone || '',
      clientAddress: client.clientAddress || '',
      clientRIB: client.rib || ''
    };

    this.clientForm.patchValue(clientData);

    const phoneControl = this.clientForm.get('clientPhone');
    const ribControl = this.clientForm.get('clientRIB');
    if (phoneControl?.invalid || ribControl?.invalid) {
      this.toastr.warning(
        this.translate.instant('DYNAMIC_MODAL.CLIENT.WARNING.INVALID_DATA'),
        this.translate.instant('DYNAMIC_MODAL.WARNING.TITLE')
      );
    }
  }

  onServiceChange(service: Service): void {
    this.servicesForm.patchValue({
      serviceReference: service.ref || '',
      serviceName: service.serviceName || '',
      servicePrice: service.servicePrice || 0
    });
  }

  onTemplateChange(modele: ModeleFacture): void {
    this.selectedModele = modele;
    if (modele && Array.isArray(modele.sections)) {
      const clientSection = modele.sections.find(s => s.sectionName.toLowerCase() === 'info-client');
      const companySection = modele.sections.find(s => s.sectionName.toLowerCase() === 'company');
      const serviceSection = modele.sections.find(s => s.sectionName.toLowerCase() === 'service');

      const clientData = this.parseSectionContent(clientSection?.content?.contentData);
      const companyData = this.parseSectionContent(companySection?.content?.contentData);
      const serviceData = this.parseSectionContent(serviceSection?.content?.contentData);

      this.clientForm.patchValue({
        companyName: companyData?.companyName || this.clientForm.get('companyName')?.value || '',
        companyAddress: companyData?.companyAddress || this.clientForm.get('companyAddress')?.value || '',
        companyType: companyData?.companyType || this.clientForm.get('companyType')?.value || '',
        companyLogo: companyData?.companyLogo || this.clientForm.get('companyLogo')?.value || ''
      });

      this.servicesForm.patchValue({
        serviceReference: serviceData?.serviceReference || '',
        serviceName: serviceData?.serviceName || '',
        servicePrice: serviceData?.servicePrice || 0
      });
    } else {
      this.clientForm.patchValue({
        companyName: this.clientForm.get('companyName')?.value || '',
        companyAddress: this.clientForm.get('companyAddress')?.value || '',
        companyType: this.clientForm.get('companyType')?.value || '',
        companyLogo: this.clientForm.get('companyLogo')?.value || ''
      });
      this.servicesForm.reset({
        selectedService: null,
        serviceReference: '',
        serviceName: '',
        servicePrice: 0
      });
      this.datesForm.patchValue({
        creationDate: new Date().toISOString().split('T')[0],
        dueDate: ''
      });
    }
  }

  private parseSectionContent(contentData: string | undefined): any {
    if (!contentData) {
      return {};
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(contentData, 'text/html');

      const data: any = {};
      const spans = doc.querySelectorAll('span');
      spans.forEach(span => {
        const text = span.textContent?.split(':')[0].trim() || '';
        if (span.textContent?.includes('#clientName')) data.clientName = text;
        if (span.textContent?.includes('#clientPhone')) data.clientPhone = text;
        if (span.textContent?.includes('#clientAddress')) data.clientAddress = text;
        if (span.textContent?.includes('#clientRIB')) data.clientRIB = text;
        if (span.textContent?.includes('#companyName')) data.companyName = text;
        if (span.textContent?.includes('#companyAddress')) data.companyAddress = text;
        if (span.textContent?.includes('#companyType')) data.companyType = text;
        if (span.textContent?.includes('#companyLogo')) data.companyLogo = text;
        if (span.textContent?.includes('#serviceReference')) data.serviceReference = text;
        if (span.textContent?.includes('#serviceName')) data.serviceName = text;
        if (span.textContent?.includes('#servicePrice')) data.servicePrice = parseFloat(text) || 0;
      });

      return data;
    } catch (error) {
      console.error('Failed to parse section content:', error);
      this.toastr.error(
        this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_PARSE_CONTENT.TEXT'),
        this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_PARSE_CONTENT.TITLE')
      );
      return {};
    }
  }
openClientModal(): void {
  const dialogRef = this.dialog.open(DynamicModalComponent, {
    data: { type: 'client' },
    width: 'max-w-2xl',
    panelClass: 'custom-dialog-container'
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.success && result.client) {
      this.clientForm.patchValue({
        selectedClient: result.client,
        clientName: result.client.clientName,
        clientPhone: result.client.clientPhone || '',
        clientAddress: result.client.clientAddress,
        clientRIB: result.client.rib || ''
      });
      this.loadClients(); // Reload clients to sync with server
    }
  });
}

  openServiceModal(): void {
    const dialogRef = this.dialog.open(DynamicModalComponent, {
      data: { type: 'service' },
      width: 'max-w-2xl',
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success && result.service) {
        this.servicesForm.patchValue({
          selectedService: result.service,
          serviceReference: result.service.ref || '',
          serviceName: result.service.serviceName || '',
          servicePrice: result.service.servicePrice || 0
        });
        this.services.push(result.service);
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid && this.servicesForm.valid && this.datesForm.valid) {
      const formData = {
        ...this.clientForm.value,
        ...this.servicesForm.value,
        ...this.datesForm.value,
        templateId: this.selectedModele?.id
      };
      console.log('Form Submitted:', formData);
      // Add logic to send formData to backend
    } else {
      this.toastr.error(
        this.translate.instant('INVOICE_TEMPLATES.MESSAGES.INVALID_FORM.TEXT'),
        this.translate.instant('INVOICE_TEMPLATES.MESSAGES.INVALID_FORM.TITLE')
      );
    }
  }
}