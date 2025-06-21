// src/app/components/liste-factures/liste-factures.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FactureServiceService } from '../services/facture-service.service';
import { Facture } from '../models/Facture';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '../services/dialog.service';
import { AuthService } from '../services/AuthService';
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
    'clientName',
    'status',
    'totalAmount',
    'actions',
  ];
  dataSource = new MatTableDataSource<Facture>([]);
  loading: boolean = false;
  pageSize: number = 10;
  pageIndex: number = 0;
  totalItems: number = 0;
  sortField: string = 'issueDate';
  sortDirection: string = 'desc';

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private factureService: FactureServiceService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadFactures();
    this.dataSource.filterPredicate = this.createFilter();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Handle sort changes
    this.sort.sortChange.subscribe((sort: Sort) => {
      this.sortField = sort.active;
      this.sortDirection = sort.direction || 'asc';
      this.pageIndex = 0; // Reset to first page on sort change
      this.loadFactures();
    });

    // Handle page changes
    this.paginator.page.subscribe((page: PageEvent) => {
      this.pageIndex = page.pageIndex;
      this.pageSize = page.pageSize;
      this.loadFactures();
    });
  }

  private createFilter(): (data: Facture, filter: string) => boolean {
    return (data, filter) => {
      const searchTerm = filter.toLowerCase();
      return (
        data.factureNumber.toLowerCase().includes(searchTerm) ||
        data.clientName?.toLowerCase().includes(searchTerm) ||
        data.status.toLowerCase().includes(searchTerm)
      );
    };
  }

loadFactures(): void {
    this.loading = true;
    const sortParam = `${this.sortField},${this.sortDirection}`;
    this.factureService.getFactures(this.pageIndex, this.pageSize, sortParam).subscribe({
        next: (response) => {
            this.dataSource.data = response.content;
            console.log('Loaded factures:', response.content); // Log pour vérifier modeleFacture
            this.totalItems = response.totalItems;
            this.paginator.length = response.totalItems;
            this.paginator.pageIndex = response.currentPage;
            this.paginator.pageSize = response.pageSize;
            this.loading = false;
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
    this.pageIndex = 0;
    this.loadFactures();
  }

  onSearchTermChange(searchTerm: string): void {
    this.dataSource.filter = searchTerm.trim().toLowerCase();
    if (this.paginator) {
      this.paginator.firstPage();
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
          this.loading = true;
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
              this.loading = false;
            },
          });
        }
      });
  }

previewFacture(id: number): void {
  this.loading = true;
  const facture = this.dataSource.data.find((f) => f.id === id);
  
  // Check if facture and its template exist
  if (!facture || !facture.modeleFacture?.id) {
    this.toastr.error(
      this.translate.instant('factures.ERROR.NO_FACTURE_OR_TEMPLATE'),
      this.translate.instant('factures.ERROR.TITLE')
    );
    this.loading = false;
    return;
  }

  this.authService.getCompanyInfo().subscribe({
    next: (companyInfo) => {
      const factureData = this.prepareFactureData(facture, companyInfo);
      // Use the template ID from the facture, not the facture ID
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

  private prepareFactureData(facture: Facture, companyInfo: any): Map<string, string> {
    const factureData = new Map<string, string>();
    let subtotal = 0;
    let taxes = 0;
    let totalAmount = 0;

    // Client Data
    factureData.set('clientName', facture.clientName || 'N/A');
    factureData.set('clientPhone', facture.clientPhone || 'N/A'); // Use facture.clientPhone
    factureData.set('clientAddress', facture.clientAddress || 'N/A'); // Use facture.clientAddress
    factureData.set('clientRIB', facture.clientRIB || 'N/A'); // Use facture.clientRIB

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

    return factureData;
  }



openModelSelectionModal(factureId: number): void {
    const dialogRef = this.dialog.open(ModelSelectionModalComponentComponent, {
      width: '800px',
      data: { factureId },
    });

    dialogRef.afterClosed().subscribe((result: Facture | undefined) => {
      if (result) {
        // Find the index of the updated facture
        const index = this.dataSource.data.findIndex((f) => f.id === result.id);
        if (index !== -1) {
          // Create a new array with the updated facture
          const updatedData = [...this.dataSource.data];
          updatedData[index] = {
            ...result,
            // Ensure all fields are properly updated
            modeleFacture: result.modeleFacture || this.dataSource.data[index].modeleFacture,
            footerText: result.footerText || this.dataSource.data[index].footerText
          };
          
          // Update the data source
          this.dataSource.data = updatedData;
        }
      }
    });
}
}
