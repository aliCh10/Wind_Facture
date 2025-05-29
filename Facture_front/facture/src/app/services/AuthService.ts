import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8090/public'; 
  private logo: File | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  register(user: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  verifyCode(email: string, code: string): Observable<any> {
    const headers = this.createHeaders();
    return this.http.post(`${this.apiUrl}/verify?email=${email}&code=${code}`, null, { headers });
  }

  login(credentials: { email: string, password: string }) {
    return this.http.post<{ token: string; role: string; name?: string; id?: number }>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      tap(response => {
        console.log('🔍 Réponse API:', response);
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        if (response.role) {
          localStorage.setItem('role', response.role);
          console.log('Role enregistré:', response.role);
        }
        if (response.name) {
          localStorage.setItem('name', response.name);
          console.log('Nom enregistré:', response.name);
        } else {
          console.warn('⚠️ Aucun name reçu du serveur.');
        }
      })
    );
  }

  getUserRole(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('role');
    }
    return null;
  }

  setLogo(logo: File | null): void {
    this.logo = logo;
  }

  getLogo(): File | null {
    return this.logo;
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password?email=${email}`, {});
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password?email=${email}&code=${code}&newPassword=${newPassword}`, {});
  }

  // New method to fetch company information
  getCompanyInfo(): Observable<{ companyName: string; address: string; tel: string; email: string; companyType: string; logoUrl: string }> {
    const headers = this.createHeaders();
    return this.http.get<{ companyName: string; address: string; tel: string; email: string; companyType: string; logoUrl: string }>(
      `${this.apiUrl}/company-info`,
      { headers }
    );
  }

  private createHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      return !!token;
    }
    return false;
  }
  

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    this.router.navigate(['/signin']);
    console.log('🔴 Utilisateur déconnecté');
  }
}