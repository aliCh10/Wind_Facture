import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { SystemService } from '../services/SystemService';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-system',
  standalone: false,
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.css']
})
export class SystemComponent implements OnInit, AfterViewInit {
sidebarMenuItems = [
  { icon: 'person', label: 'MENU.Partners', route: '/systeme' },
  { icon: 'settings', label: 'MENU.SETTINGS', route: '/settings' },
];

  partners: any[] = [];
  currentPartner: any = {}; 
  isTableEmpty: boolean = false; // New variable to track if table is empty
  displayedColumns: string[] = ['name', 'email', 'companyName', 'status', 'actions'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;  

  constructor(private systemService: SystemService, private snackBar: MatSnackBar ,private translate: TranslateService, private toastr: ToastrService)
  {
    translate.setDefaultLang('fr');
    translate.use('fr');  
  }

  ngOnInit(): void {
    this.getPartners();
  }
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  getPartners(): void {
    this.systemService.getPartners().subscribe(
      (data) => {
        this.partners = data;
        this.dataSource.data = data;
        this.isTableEmpty = this.partners.length === 0; // Check if partners array is empty

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      },
      (error) => {
        this.toastr.error('Error fetching partners!', 'error');
        console.error('Error fetching partners:', error);
      }
    );
  }
  

  validatePartner(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to validate this partner?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, validate it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.systemService.validatePartner(id).subscribe(
          (response) => {
            this.toastr.success(response.message, 'Success');
            this.getPartners(); // Rafraîchir la liste après validation
          },
          (error) => {
            this.toastr.error('Validation failed.', 'Error');
            console.error('Error validating partner:', error);
          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'The partner was not validated.', 'info');
      }
    });
  }
  

  deletePartner(id: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this partner!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.isConfirmed) {
        // Si l'utilisateur confirme, supprimez le partenaire
        this.systemService.deletePartner(id).subscribe(
          (response) => {
            this.toastr.success(response.message, 'Success');
            this.getPartners(); // Rafraîchir la liste des partenaires
          },
          (error) => {
            this.toastr.error(error.error?.message || 'Deletion failed.', 'Error');
            console.error('Error deleting partner:', error);
          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Si l'utilisateur annule, affichez un message
        Swal.fire('Cancelled', 'Your partner is safe :)', 'info');
      }
    });
  }

  onPageChange(event: any): void {
    this.dataSource.paginator!.pageIndex = event.pageIndex;
    this.dataSource.paginator!.pageSize = event.pageSize;
  }


}
