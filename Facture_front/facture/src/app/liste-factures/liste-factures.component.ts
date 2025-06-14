import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { FactureServiceService } from '../services/facture-service.service';
import { Facture } from '../models/Facture';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../services/dialog.service';
import { ClientService } from '../services/ClientService';
import { AuthService } from '../services/AuthService';
import { Client } from '../models/Client';
import { ModelSelectionModalComponentComponent } from '../components/model-selection-modal-component/model-selection-modal-component.component';

@Component({
  selector: 'app-liste-factures',
  standalone: false,
  templateUrl: './liste-factures.component.html',
  styleUrls: ['./liste-factures.component.css'],
})
export class ListeFacturesComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'factureNumber',
    'issueDate',
  'clientName', // Remplace dueDate
    'status',
    'totalAmount',
    'actions',
  ];
  dataSource = new MatTableDataSource<Facture>([]);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private factureService: FactureServiceService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private clientService: ClientService,
    private authService: AuthService
  ) {}
  loading: boolean = false;

  ngOnInit(): void {
    this.loadFactures();
    this.dataSource.filterPredicate = this.createFilter();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private createFilter(): (data: Facture, filter: string) => boolean {
    return (data, filter) => {
      const searchTerm = filter.toLowerCase();
      return data.factureNumber.toLowerCase().includes(searchTerm);
    };
  }


loadFactures(): void {
  this.loading = true;
  this.factureService.getAllFactures().subscribe({
    next: (factures) => {
      // Chargez les noms des clients pour chaque facture
      const facturePromises = factures.map(facture => 
        this.clientService.getClientById(facture.clientId).toPromise()
          .then(client => ({
            ...facture,
            footerText: facture.footerText || 'N/A',
            clientName: client?.clientName || 'N/A' // Ajoutez le nom du client
          }))
          .catch(() => ({
            ...facture,
            footerText: facture.footerText || 'N/A',
            clientName: 'N/A' // Valeur par défaut en cas d'erreur
          })));

      Promise.all(facturePromises).then(facturesWithClients => {
        this.dataSource.data = facturesWithClients;
        this.loading = false;
      });
    },
    error: (err) => {
      console.error('Failed to load factures:', err);
      this.toastr.error(
        this.translate.instant('factures.ERROR.LOAD_FAILED'),
        this.translate.instant('factures.ERROR.TITLE')
      );
      this.loading = false;
    },
  });
}

  refreshFactures(): void {
    this.loadFactures();
  }

  onSearchTermChange(searchTerm: string): void {
    this.dataSource.filter = searchTerm.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteFacture(id: number): void {
    this.dialogService
      .openConfirmDialog({
        title: this.translate.instant('factures.CONFIRM.DELETE_TITLE'),
        message: this.translate.instant('factures.CONFIRM.DELETE_TEXT'),
        cancelText: this.translate.instant('factures.CONFIRM.CANCEL'),
        confirmText: this.translate.instant('factures.CONFIRM.OK'),
      })
      .subscribe((result) => {
        if (result) {
          this.factureService.deleteFacture(id).subscribe({
            next: () => {
              this.toastr.success(
                this.translate.instant('factures.SUCCESS.DELETE'),
                this.translate.instant('factures.SUCCESS.TITLE')
              );
              this.loadFactures();
            },
            error: (error) => {
              console.error('Error deleting facture:', error);
              this.toastr.error(
                this.translate.instant('factures.ERROR.DELETE_FAILED'),
                this.translate.instant('factures.ERROR.TITLE')
              );
            },
          });
        }
      });
  }

  previewFacture(id: number): void {
    this.loading = true;
    const facture = this.dataSource.data.find((f) => f.id === id);
    if (!facture || !facture.modeleFacture?.id) {
      this.toastr.error(
        this.translate.instant('factures.ERROR.NO_FACTURE_OR_TEMPLATE'),
        this.translate.instant('factures.ERROR.TITLE')
      );
      this.loading = false;
      return;
    }

    this.clientService.getClientById(facture.clientId).subscribe({
      next: (client: Client) => {
        this.authService.getCompanyInfo().subscribe({
          next: (companyInfo) => {
            const factureData = this.prepareFactureData(facture, client, companyInfo);
            this.factureService.generatePdfPreview(facture.modeleFacture.id, factureData).subscribe({
              next: (pdfBlob: Blob) => {
                const blobUrl = URL.createObjectURL(pdfBlob);
                window.open(blobUrl, '_blank');
                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                
                this.loading = false;
              },
              error: (error) => {
                console.error('Error generating PDF preview:', error);
                this.toastr.error(
                  this.translate.instant('factures.ERROR.PREVIEW_FAILED'),
                  this.translate.instant('factures.ERROR.TITLE')
                );
                this.loading = false;
              },
            });
          },
          error: () => {
            this.toastr.error(
              this.translate.instant('factures.ERROR.COMPANY_INFO_FAILED'),
              this.translate.instant('factures.ERROR.TITLE')
            );
            this.loading = false;
          },
        });
      },
      error: () => {
        this.toastr.error(
          this.translate.instant('factures.ERROR.CLIENT_FETCH_FAILED'),
          this.translate.instant('factures.ERROR.TITLE')
        );
        this.loading = false;
      },
    });
  }

  private calculateServiceAmounts(service: any): { subtotal: number; taxes: number; total: number } {
    const servicePrice = Number(service.servicePrice) || 0;
    const quantity = Number(service.quantity) || 1;
    const tvaPercentage = Number(service.tva) || 0;
    const discountPercentage = Number(service.discount) || 0;

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

  private prepareFactureData(facture: Facture, client: Client, companyInfo: any): Map<string, string> {
    const factureData = new Map<string, string>();
    let subtotal = 0;
    let taxes = 0;
    let totalAmount = 0;

    // Client Data
    factureData.set('clientName', client.clientName || 'N/A');
    factureData.set('clientPhone', client.clientPhone || 'N/A');
    factureData.set('clientAddress', client.clientAddress || 'N/A');
    factureData.set('clientRIB', client.rib || 'N/A');

    // Company Data
    factureData.set('companyName', companyInfo.companyName || 'N/A');
    factureData.set('companyAddress', companyInfo.address || 'N/A');
    factureData.set('companyPhone', companyInfo.tel || 'N/A');
    factureData.set('companyLogo', companyInfo.logoUrl || '');

    // Dates
    factureData.set('creationDate', facture.issueDate ? new Date(facture.issueDate).toLocaleDateString() : 'N/A');
    factureData.set('dueDate', facture.dueDate ? new Date(facture.dueDate).toLocaleDateString() : 'N/A');

    // Footer
    factureData.set('footerText', facture.footerText || 'N/A');

    // Services
    facture.factureServices?.forEach((service, index) => {
      const prefix = `service_${index + 1}_`;
      const amounts = this.calculateServiceAmounts(service);

      factureData.set(`${prefix}name`, service.serviceName || 'N/A');
      factureData.set(`${prefix}reference`, service.serviceReference || 'N/A');
      factureData.set(`${prefix}price`, service.servicePrice?.toString() || '0');
      factureData.set(`${prefix}quantity`, service.quantity?.toString() || '1');
      factureData.set(`${prefix}tva`, service.tva?.toString() || '0');
      factureData.set(`${prefix}discount`, service.discount?.toString() || '0');
      factureData.set(`${prefix}total`, amounts.total.toString());

      subtotal += amounts.subtotal;
      taxes += amounts.taxes;
      totalAmount += amounts.total;
    });

    // Totals
    factureData.set('subtotal', subtotal.toFixed(2));
    factureData.set('taxes', taxes.toFixed(2));
    factureData.set('totalAmount', totalAmount.toFixed(2));

    console.log('factureData:', Object.fromEntries(factureData)); // Debug
    return factureData;
  }

  openModelSelectionModal(factureId: number): void {
    const dialogRef = this.dialog.open(ModelSelectionModalComponentComponent, {
      width: '800px',
      data: { factureId },
    });

    dialogRef.afterClosed().subscribe((result: Facture | undefined) => {
      if (result) {
        // Update the facture in the data source
        const index = this.dataSource.data.findIndex((f) => f.id === result.id);
        if (index !== -1) {
          this.dataSource.data[index] = {
            ...result,
            footerText: result.footerText || 'N/A', // Ensure footerText consistency
          };
          this.dataSource.data = [...this.dataSource.data]; // Trigger change detection
        
        }
      }
    });
  }
}