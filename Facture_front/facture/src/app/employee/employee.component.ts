import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeService } from '../services/employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UpdateEmployeeModalComponent } from '../components/update-employee-modal/update-employee-modal.component';

@Component({
  selector: 'app-employee',
  standalone:false,
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css']
})
export class EmployeeComponent implements OnInit {
  employees: any[] = [];
  displayedColumns: string[] = ['name', 'secondName', 'email', 'tel', 'department', 'post', 'actions'];
  partnerId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('partnerId');
      this.partnerId = id ? +id : null;
      console.log('Partner ID from URL:', this.partnerId);
      this.fetchEmployees();
    });
  }

  fetchEmployees(): void {
    if (!this.partnerId) {
      console.warn("Impossible de charger les employés sans partnerId");
      return;
    }
    
    this.employeeService.getAllEmployees().subscribe(
      (response) => {
        this.employees = response;
        console.log('List of employees:', this.employees);
      },
      (error) => {
        console.error('Error fetching employees', error);
      }
    );
  }
  refreshEmployees(): void {
    console.log('🔄 Rafraîchissement de la liste des employés');
    this.fetchEmployees(); // 🔹 Rafraîchir la liste
  }
  openUpdateModal(employee: any) {
    const dialogRef = this.dialog.open(UpdateEmployeeModalComponent, {
      width: '400px',
      data: {
        employee: employee // Pass the employee data to the modal
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        // Show success message using Swal.fire
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Employé mis à jour avec succès'
        }).then(() => {
          this.fetchEmployees(); // Reload employees after update
        });
      } else {
        // Show error message if the update was unsuccessful
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la mise à jour de l\'employé'
        });
      }
    });
  }
  

  deleteEmployee(employeeId: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.employeeService.deleteEmployee(employeeId).subscribe(
          () => {
            this.employees = this.employees.filter(e => e.id !== employeeId);
            Swal.fire('Supprimé!', 'L\'employé a été supprimé.', 'success');
          },
          (error) => {
            Swal.fire('Erreur!', 'Impossible de supprimer l\'employé.', 'error');
            console.error('Erreur lors de la suppression de l\'employé', error);
          }
        );
      }
    });
  }
}