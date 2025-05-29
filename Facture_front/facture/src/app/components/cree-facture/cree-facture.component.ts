import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
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
import { FactureServiceService } from '../../services/facture-service.service';
import { CreateFactureRequest, ServiceRequest } from '../../models/CreateFactureRequest';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-cree-facture',
  standalone: false,
  templateUrl: './cree-facture.component.html',
  styleUrls: ['./cree-facture.component.css'],
})
export class CreeFactureComponent implements OnInit, OnDestroy {
  clientForm: FormGroup;
  servicesForm: FormGroup;
  serviceForms: FormGroup[] = [];
  datesForm: FormGroup;
  footerForm: FormGroup;
  modeles: ModeleFacture[] = [];
  clients: Client[] = [];
  services: Service[] = [];
  thumbnailUrls: { [key: number]: SafeUrl | string } = {};
  loading = false;
  subtotal = 0;
  taxes = 0;
  totalAmount = 0;

  private formValueSubscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private modeleFactureService: ModeleFactureService,
    private clientService: ClientService,
    private serService: SerService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private invoiceService: FactureServiceService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize forms
    this.clientForm = this.fb.group({
      selectedClient: [null, Validators.required],
      selectedModele: [null, Validators.required],
      clientName: [{ value: '', disabled: true }, Validators.required],
      clientPhone: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^\+?\d{8,15}$/)]],
      clientAddress: [{ value: '', disabled: true }, Validators.required],
      clientRIB: [{ value: '', disabled: true }, Validators.required],
      companyName: [{ value: '', disabled: true }, Validators.required],
      companyAddress: [{ value: '', disabled: true }, Validators.required],
      companyPhone: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^\+?\d{8,15}$/)]],
      companyLogo: ['', Validators.required],
    });

    this.servicesForm = this.fb.group({
      selectedService: [null, Validators.required],
      serviceReference: [{ value: '', disabled: true }, Validators.required],
      serviceName: [{ value: '', disabled: true }, Validators.required],
      servicePrice: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      tva: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      discount: [0, [Validators.required, Validators.min(0)]],
    });

    this.datesForm = this.fb.group({
      creationDate: [new Date().toISOString().split('T')[0], Validators.required],
      dueDate: ['', Validators.required],
    });

    this.footerForm = this.fb.group({
      footerText: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  // Step control groups
  get clientStepControls(): FormGroup {
    return this.fb.group({
      selectedClient: this.clientForm.get('selectedClient'),
      selectedModele: this.clientForm.get('selectedModele'),
    });
  }

  get companyStepControls(): FormGroup {
    return this.fb.group({
      companyName: this.clientForm.get('companyName'),
      companyAddress: this.clientForm.get('companyAddress'),
      companyPhone: this.clientForm.get('companyPhone'),
      companyLogo: this.clientForm.get('companyLogo'),
    });
  }

  get servicesStepControls(): FormGroup {
    return this.fb.group({
      selectedService: this.servicesForm.get('selectedService'),
      serviceReference: this.servicesForm.get('serviceReference'),
      serviceName: this.servicesForm.get('serviceName'),
      servicePrice: this.servicesForm.get('servicePrice'),
      quantity: this.servicesForm.get('quantity'),
      tva: this.servicesForm.get('tva'),
      discount: this.servicesForm.get('discount'),
    });
  }

  ngOnInit(): void {
    this.loadModeles();
    this.loadClients();
    this.loadServices();
    this.loadCompanyInfo();

    // Subscribe to form changes
    this.formValueSubscription.add(
      this.servicesForm.valueChanges.pipe(debounceTime(300)).subscribe(() => this.updateCalculations())
    );

    this.serviceForms.forEach((form) =>
      this.formValueSubscription.add(
        form.valueChanges.pipe(debounceTime(300)).subscribe(() => this.updateCalculations())
      )
    );

    this.updateCalculations();
  }

  ngOnDestroy(): void {
    this.formValueSubscription.unsubscribe();
  }

  addServiceBlock(): void {
    const newServiceForm = this.fb.group({
      selectedService: [null, Validators.required],
      serviceReference: [{ value: '', disabled: true }, Validators.required],
      serviceName: [{ value: '', disabled: true }, Validators.required],
      servicePrice: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      tva: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      discount: [0, [Validators.required, Validators.min(0)]],
    });

    this.formValueSubscription.add(
      newServiceForm.valueChanges.pipe(debounceTime(300)).subscribe(() => this.updateCalculations())
    );

    this.serviceForms.push(newServiceForm);
    this.updateCalculations();
  }

  removeServiceBlock(index: number): void {
    this.serviceForms.splice(index, 1);
    this.updateCalculations();
  }

  private calculateBlockAmounts(form: FormGroup): { subtotal: number; taxes: number; total: number } {
    const servicePrice = Number(form.get('servicePrice')?.value) || 0;
    const quantity = Number(form.get('quantity')?.value) || 1;
    const tvaPercentage = Number(form.get('tva')?.value) || 0;
    const discountPercentage = Number(form.get('discount')?.value) || 0;

    const subtotal = servicePrice * quantity;
    const discountAmount = subtotal * (discountPercentage / 100);
    const amountAfterDiscount = subtotal - discountAmount;
    const taxes = amountAfterDiscount * (tvaPercentage / 100);
    const total = amountAfterDiscount + taxes;

    return {
      subtotal: Number(subtotal.toFixed(2)),
      taxes: Number(taxes.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  }

  get mainServiceAmounts(): { subtotal: number; taxes: number; total: number } {
    return this.calculateBlockAmounts(this.servicesForm);
  }

  getBlockAmounts(index: number): { subtotal: number; taxes: number; total: number } {
    return this.calculateBlockAmounts(this.serviceForms[index]);
  }

  private updateCalculations(): void {
    this.subtotal = 0;
    this.taxes = 0;
    this.totalAmount = 0;

    if (this.servicesForm.get('selectedService')?.value) {
      const mainAmounts = this.calculateBlockAmounts(this.servicesForm);
      this.subtotal += mainAmounts.subtotal;
      this.taxes += mainAmounts.taxes;
      this.totalAmount += mainAmounts.total;
    }

    this.serviceForms.forEach((serviceForm) => {
      if (serviceForm.get('selectedService')?.value) {
        const amounts = this.calculateBlockAmounts(serviceForm);
        this.subtotal += amounts.subtotal;
        this.taxes += amounts.taxes;
        this.totalAmount += amounts.total;
      }
    });

    this.subtotal = Number(this.subtotal.toFixed(2));
    this.taxes = Number(this.taxes.toFixed(2));
    this.totalAmount = Number(this.totalAmount.toFixed(2));
  }

  private loadCompanyInfo(): void {
    this.loading = true;
    this.authService.getCompanyInfo().subscribe({
      next: (companyInfo) => {
        this.clientForm.patchValue({
          companyName: companyInfo.companyName || '',
          companyAddress: companyInfo.address || '',
          companyPhone: companyInfo.tel || '',
          companyLogo: companyInfo.logoUrl || '',
        });
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error(
          this.translate.instant('AUTH.ERROR.GENERIC'),
          this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
        );
        console.error('Failed to load company info:', error);
        this.clientForm.patchValue({ companyLogo: '' });
      },
    });
  }

  handleLogoError(): void {
    this.toastr.warning(
      this.translate.instant('CREATE_INVOICE.ERRORS.LOGO_LOAD_FAILED'),
      this.translate.instant('DYNAMIC_MODAL.WARNING.TITLE')
    );
    this.clientForm.patchValue({ companyLogo: '' });
  }

  loadClients(): void {
    this.loading = true;
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.loading = false;
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('DYNAMIC_MODAL.CLIENT.ERROR.FETCH_FAILED'),
          this.translate.instant('DYNAMIC_MODAL.ERROR.TITLE')
        );
        this.loading = false;
      },
    });
  }

  loadServices(): void {
    this.loading = true;
    this.serService.getAllServices().subscribe({
      next: (services) => {
        this.services = services;
        this.loading = false;
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('SERVICES_PAGE.ERROR.LOAD_FAILED'),
          this.translate.instant('SERVICES_PAGE.ERROR.TITLE')
        );
        this.loading = false;
      },
    });
  }

  loadModeles(): void {
    this.loading = true;
    this.modeleFactureService.getAllModelesFacture().subscribe({
      next: (modeles) => {
        this.modeles = modeles;
        this.modeles.forEach((modele) => {
          if (modele.id) {
            this.loadThumbnail(modele.id);
          }
        });
        this.loading = false;
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_LOAD_TEMPLATES.TEXT'),
          this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_LOAD_TEMPLATES.TITLE')
        );
        this.loading = false;
      },
    });
  }

  private loadThumbnail(id: number): void {
    this.modeleFactureService.getModeleThumbnail(id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.thumbnailUrls[id] = this.sanitizer.bypassSecurityTrustUrl(url);
      },
      error: () => {
        this.thumbnailUrls[id] = '';
      },
    });
  }

  getThumbnailUrl(modele: ModeleFacture): SafeUrl | string {
    return modele.id && this.thumbnailUrls[modele.id] ? this.thumbnailUrls[modele.id] : '';
  }

  handleImageError(event: Event, modele: ModeleFacture): void {
    if (modele.id) {
      this.thumbnailUrls[modele.id] = '';
    }
  }

  onClientChange(client: Client): void {
    this.clientForm.patchValue({
      selectedClient: client,
      clientName: client.clientName || '',
      clientPhone: client.clientPhone || '',
      clientAddress: client.clientAddress || '',
      clientRIB: client.rib || '',
    });

    const phoneControl = this.clientForm.get('clientPhone');
    const ribControl = this.clientForm.get('clientRIB');
    if (phoneControl?.invalid || ribControl?.invalid) {
      this.toastr.warning(
        this.translate.instant('DYNAMIC_MODAL.CLIENT.WARNING.INVALID_DATA'),
        this.translate.instant('DYNAMIC_MODAL.WARNING.TITLE')
      );
    }
  }

  onServiceChange(service: Service, form?: FormGroup): void {
    const targetForm = form || this.servicesForm;
    targetForm.patchValue({
      selectedService: service,
      serviceReference: service.ref || '',
      serviceName: service.serviceName || '',
      servicePrice: Number(service.servicePrice) || 0,
    });
    this.updateCalculations();
  }

  openClientModal(): void {
    const dialogRef = this.dialog.open(DynamicModalComponent, {
      data: { type: 'client' },
      width: 'max-w-2xl',
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success && result.client) {
        this.clients = [...this.clients, result.client];
        this.onClientChange(result.client);
        this.clientForm.get('selectedClient')?.updateValueAndValidity();
      }
    });
  }

  openServiceModal(): void {
    const dialogRef = this.dialog.open(DynamicModalComponent, {
      data: { type: 'service' },
      width: 'max-w-2xl',
      panelClass: 'custom-dialog-container',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success && result.service) {
        this.services = [...this.services, result.service];
        this.onServiceChange(result.service);
        this.loadServices();
        this.updateCalculations();
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.areAllFormsValid()) {
      this.toastr.error(
        this.translate.instant('INVOICE_TEMPLATES.MESSAGES.INVALID_FORM.TEXT'),
        this.translate.instant('INVOICE_TEMPLATES.MESSAGES.INVALID_FORM.TITLE')
      );
      this.markFormsAsTouched();
      return;
    }

    const selectedClient = this.clientForm.get('selectedClient')?.value;
    const selectedModele = this.clientForm.get('selectedModele')?.value;
    const mainService = this.servicesForm.get('selectedService')?.value;

    if (!selectedModele?.id || !selectedClient?.id || !mainService?.id) {
      this.toastr.error(
        this.translate.instant('INVOICE_TEMPLATES.MESSAGES.INVALID_FORM.TEXT'),
        this.translate.instant('INVOICE_TEMPLATES.MESSAGES.INVALID_FORM.TITLE')
      );
      return;
    }

    const services: ServiceRequest[] = [
      {
        serviceId: Number(mainService.id),
        servicePrice: Number(this.servicesForm.get('servicePrice')?.value) || 0,
        quantity: Number(this.servicesForm.get('quantity')?.value) || 1,
        tva: Number(this.servicesForm.get('tva')?.value) || 0,
        discount: Number(this.servicesForm.get('discount')?.value) || 0,
      },
    ];

    this.serviceForms.forEach((serviceForm) => {
      const service = serviceForm.get('selectedService')?.value;
      if (service?.id) {
        services.push({
          serviceId: Number(service.id),
          servicePrice: Number(serviceForm.get('servicePrice')?.value) || 0,
          quantity: Number(serviceForm.get('quantity')?.value) || 1,
          tva: Number(serviceForm.get('tva')?.value) || 0,
          discount: Number(serviceForm.get('discount')?.value) || 0,
        });
      }
    });

    const formData: CreateFactureRequest = {
      templateId: Number(selectedModele.id),
      clientId: Number(selectedClient.id),
      services,
      creationDate: this.datesForm.get('creationDate')?.value || new Date().toISOString().split('T')[0],
      dueDate: this.datesForm.get('dueDate')?.value || '',
    };

    if (!formData.creationDate || !formData.dueDate) {
      this.toastr.error(
        this.translate.instant('INVOICE_TEMPLATES.MESSAGES.INVALID_DATES.TEXT'),
        this.translate.instant('INVOICE_TEMPLATES.MESSAGES.INVALID_DATES.TITLE')
      );
      return;
    }

    this.loading = true;
    this.invoiceService.createInvoice(formData).subscribe({
      next: () => {
        this.loading = false;
        this.toastr.success(
          this.translate.instant('CREATE_INVOICE.MESSAGES.INVOICE_CREATED.TEXT'),
          this.translate.instant('CREATE_INVOICE.MESSAGES.INVOICE_CREATED.TITLE')
        );
        this.resetForms();
      },
      error: (error) => {
        this.loading = false;
        this.toastr.error(
          this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_CREATE_INVOICE.TEXT'),
          this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_CREATE_INVOICE.TITLE')
        );
        console.error('Failed to create invoice:', error);
      },
    });
  }

  private resetForms(): void {
    this.clientForm.reset({
      selectedClient: null,
      selectedModele: null,
      clientName: '',
      clientPhone: '',
      clientAddress: '',
      clientRIB: '',
      companyName: '',
      companyAddress: '',
      companyPhone: '',
      companyLogo: '',
    });
    this.servicesForm.reset({
      selectedService: null,
      serviceReference: '',
      serviceName: '',
      servicePrice: 0,
      quantity: 1,
      tva: 0,
      discount: 0,
    });
    this.datesForm.reset({
      creationDate: new Date().toISOString().split('T')[0],
      dueDate: '',
    });
    this.footerForm.reset({ footerText: '' });
    this.serviceForms = [];
    this.updateCalculations();
  }

  private markFormsAsTouched(): void {
    this.clientForm.markAllAsTouched();
    this.servicesForm.markAllAsTouched();
    this.datesForm.markAllAsTouched();
    this.footerForm.markAllAsTouched();
    this.serviceForms.forEach((form) => form.markAllAsTouched());
  }

 private prepareFactureData(): Map<string, string> {
    const factureData = new Map<string, string>();

    // Client Data
 factureData.set('clientName', this.clientForm.get('clientName')?.value );
    factureData.set('clientPhone', this.clientForm.get('clientPhone')?.value );
    factureData.set('clientAddress', this.clientForm.get('clientAddress')?.value );
    factureData.set('clientRIB', this.clientForm.get('clientRIB')?.value );

    // Company Data
    factureData.set('companyName', this.clientForm.get('companyName')?.value || 'N/A');
    factureData.set('companyAddress', this.clientForm.get('companyAddress')?.value || 'N/A');
    factureData.set('companyPhone', this.clientForm.get('companyPhone')?.value || 'N/A');
    factureData.set('companyLogo', this.clientForm.get('companyLogo')?.value || '');

    // Main Service
   const mainService = this.servicesForm.get('selectedService')?.value;
    if (mainService) {
        factureData.set('serviceName', mainService.serviceName || '');
        factureData.set('serviceReference', this.servicesForm.get('serviceReference')?.value || '');
        factureData.set('servicePrice', this.servicesForm.get('servicePrice')?.value?.toString() || '0');
        factureData.set('quantity', this.servicesForm.get('quantity')?.value?.toString() || '1');
        factureData.set('tva', this.servicesForm.get('tva')?.value?.toString() || '0');
        factureData.set('discount', this.servicesForm.get('discount')?.value?.toString() || '0');
        factureData.set('serviceTotal', this.calculateBlockAmounts(this.servicesForm).total.toString());
    }
    // Additional services
    this.serviceForms.forEach((serviceForm, index) => {
        const service = serviceForm.get('selectedService')?.value;
        if (service) {
            const prefix = `service_${index + 1}_`;
            factureData.set(`${prefix}name`, service.serviceName || '');
            factureData.set(`${prefix}reference`, serviceForm.get('serviceReference')?.value || '');
            factureData.set(`${prefix}price`, serviceForm.get('servicePrice')?.value?.toString() || '0');
            factureData.set(`${prefix}quantity`, serviceForm.get('quantity')?.value?.toString() || '1');
            factureData.set(`${prefix}tva`, serviceForm.get('tva')?.value?.toString() || '0');
            factureData.set(`${prefix}discount`, serviceForm.get('discount')?.value?.toString() || '0');
            factureData.set(`${prefix}total`, this.getBlockAmounts(index).total.toString());
        }
    });

    // Dates
    const creationDate = this.datesForm.get('creationDate')?.value;
    const dueDate = this.datesForm.get('dueDate')?.value;
    factureData.set('creationDate', creationDate ? new Date(creationDate).toLocaleDateString() : 'N/A');
    factureData.set('dueDate', dueDate ? new Date(dueDate).toLocaleDateString() : 'N/A');

    // Footer
    factureData.set('footerText', this.footerForm.get('footerText')?.value || 'N/A');

    // Totals
    factureData.set('subtotal', this.subtotal.toFixed(2));
    factureData.set('taxes', this.taxes.toFixed(2));
    factureData.set('totalAmount', this.totalAmount.toFixed(2));

    console.log('factureData:', Object.fromEntries(factureData)); // Debug
    return factureData;
}
  areAllServiceFormsValid(): boolean {
    return this.servicesForm.valid && this.serviceForms.every((form) => form.valid);
  }

  areAllFormsValid(): boolean {
    return (
      this.clientForm.valid &&
      this.servicesForm.valid &&
      this.datesForm.valid &&
      this.footerForm.valid &&
      this.areAllServiceFormsValid()
    );
  }
previewInvoice(): void {
    if (!this.areAllFormsValid()) {
        this.toastr.error(
            this.translate.instant('INVOICE_TEMPLATES.MESSAGES.INVALID_FORM.TEXT'),
            this.translate.instant('INVOICE_TEMPLATES.MESSAGES.INVALID_FORM.TITLE')
        );
        this.markFormsAsTouched();
        return;
    }

    const selectedModele = this.clientForm.get('selectedModele')?.value;
    if (!selectedModele?.id) {
        this.toastr.error(
            this.translate.instant('INVOICE_TEMPLATES.MESSAGES.NO_TEMPLATE_SELECTED.TEXT'),
            this.translate.instant('INVOICE_TEMPLATES.MESSAGES.NO_TEMPLATE_SELECTED.TITLE')
        );
        return;
    }

    this.loading = true;
    const factureData = this.prepareFactureData();
    this.invoiceService.generatePdfPreview(selectedModele.id, factureData).subscribe({
        next: (pdfBlob: Blob) => {
            const blobUrl = URL.createObjectURL(pdfBlob);
            window.open(blobUrl, '_blank');
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            this.loading = false;
        },
        error: (error) => {
            console.error('Error generating PDF preview:', error);
            this.toastr.error(
                this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_LOAD_PDF.TEXT'),
                this.translate.instant('INVOICE_TEMPLATES.MESSAGES.FAILED_LOAD_PDF.TITLE')
            );
            this.loading = false;
        }
    });
}

}