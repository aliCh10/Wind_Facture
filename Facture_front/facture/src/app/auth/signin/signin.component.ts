import { Component } from '@angular/core';
import { AuthService } from '../../services/AuthService';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { PasswordChangeDialogComponent } from '../../components/password-change-dialog/password-change-dialog.component';

@Component({
  selector: 'app-signin',
  standalone: false,
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  passwordVisible: boolean = false;
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {}

  onLogin(form: NgForm) {
    if (form.invalid) {
      this.toastr.error('Veuillez remplir tous les champs requis', 'Erreur');
      return;
    }
    this.loading = true;

    const credentials = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);

          if (response.role) {
            localStorage.setItem('role', response.role);
            this.toastr.success('Connexion réussie', 'Succès');

            if (response.name) {
              localStorage.setItem('name', response.name);
            }
            if (response.id) {
              localStorage.setItem('partnerId', response.id.toString());
            }

            // Handle EMPLOYE role
            if (response.role === 'EMPLOYE') {
              this.router.navigate(['/home']).then(() => {
                this.showPasswordChangeDialog(response).afterClosed().subscribe();
              });
            } else if (response.role === 'System') {
              this.router.navigate(['/system']);
            } else if (response.role === 'PARTNER') {
              this.router.navigate(['/home']);
            } else {
              this.router.navigate(['/signup']);
            }
          } else {
            this.toastr.error('Aucun rôle reçu du serveur', 'Erreur');
          }
        } else {
          this.toastr.error('Aucun jeton reçu du serveur', 'Erreur');
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        let errorMessage = 'Une erreur s\'est produite lors de la connexion. Veuillez réessayer.';
        if (error.status === 400 && error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 401) {
          errorMessage = 'Email ou mot de passe invalide';
        }
        this.toastr.error(errorMessage, 'Erreur');
      }
    });
  }

  private showPasswordChangeDialog(userData: any) {
    return this.dialog.open(PasswordChangeDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { 
        employeeId: userData.id,
        email: userData.email 
      },
      panelClass: 'custom-dialog'
    });
  }
}