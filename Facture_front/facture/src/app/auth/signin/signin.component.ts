import { Component } from '@angular/core';
import { AuthService } from '../../services/AuthService';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-signin',
  standalone: false,
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {

  email: string = '';
  password: string = '';
  errorMessage: string = '';
  passwordVisible: boolean = false; 


  constructor(
    private authService: AuthService, 
    private router: Router, 
    private toastr: ToastrService,
    private translate: TranslateService
  ) {}

  loading = false;

  onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.loading = true;
  
    const credentials = {
      email: this.email,
      password: this.password
    };
  
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Response:', response);
        if (response && response.token) {
          console.log('Token reçu:', response.token);
          localStorage.setItem('token', response.token);

          if (response.role) {
            localStorage.setItem('role', response.role);
            console.log('Role enregistré dans localStorage:', response.role);
            this.toastr.success('Login successful!', 'Success');

            if (response.name) {
              localStorage.setItem('name', response.name);
              console.log('Nom dans localStorage:', localStorage.getItem('name'));
            }
            if (response.id) {
              localStorage.setItem('partnerId', response.id.toString());
              console.log('Partner ID stored in localStorage:', response.id);
            }

            if (response.role === 'System') {
              this.router.navigate(['/system']).then(() => {
                console.log('Navigated to /system');
              });
            } else if (response.role === 'PARTNER' || response.role === 'EMPLOYE') {
              this.router.navigate(['/home']).then(() => {
                console.log('Navigated to /home');
              });
            } else {
              this.router.navigate(['/signup']).then(() => {
                console.log('Navigated to /signup');
              });
            }
          } else {
            this.toastr.error('No role received from server.', 'Login Failed');
            console.error('Erreur: Aucun rôle reçu du serveur');
          }
        } else {
          this.toastr.error('No token received from server.', 'Login Failed');
          console.error('Erreur: Aucun token reçu du serveur');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur de connexion:', error);
        this.loading = false;
        let errorMessage = 'Login failed. Please check your credentials and try again.';
        if (error.status === 400 && error.error?.message) {
          errorMessage = error.error.message; // e.g., "Votre compte n'a pas été validé depuis le système"
        } else if (error.status === 401) {
          errorMessage = 'Invalid email or password.';
        }
        this.toastr.error(errorMessage, 'Login Failed');
      }
    });
  }
  
}