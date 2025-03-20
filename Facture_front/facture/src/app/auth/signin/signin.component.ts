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

            // 🔹 Redirection selon le rôle
            if (response.role === 'System') {
              this.router.navigate(['/system']);
            } else if (response.role === 'PARTNER') {
              this.router.navigate(['/home']);
            } else {
              this.router.navigate(['/signup']);
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
        this.toastr.error('Invalid email or password.', 'Login Failed');
      }
    });
  }
}