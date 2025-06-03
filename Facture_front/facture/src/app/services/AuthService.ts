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
  private userNameSubject = new BehaviorSubject<string | null>(null);
  private userRoleSubject = new BehaviorSubject<string | null>(null); // New Subject for role

  constructor(private http: HttpClient, private router: Router) {
    if (typeof window !== 'undefined' && window.localStorage) {
      this.userNameSubject.next(localStorage.getItem('name'));
      this.userRoleSubject.next(localStorage.getItem('role')); // Initialize role
    }
  }

  updateUserName(name: string | null): void {
    this.userNameSubject.next(name);
  }

  getUserNameObservable(): Observable<string | null> {
    return this.userNameSubject.asObservable();
  }

  updateUserRole(role: string | null): void {
    this.userRoleSubject.next(role); // Emit role changes
  }

  getUserRoleObservable(): Observable<string | null> {
    return this.userRoleSubject.asObservable(); // Allow subscription to role changes
  }

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
          this.updateUserRole(response.role); // Emit new role
          console.log('Role enregistré:', response.role);
        }
        if (response.name) {
          localStorage.setItem('name', response.name);
          this.updateUserName(response.name); // Emit name
          console.log('Nom enregistré:', response.name);
        } else {
          console.warn('⚠️ Aucun name reçu du serveur.');
        }
      })
    );
  }

  getUserRole(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('role');
    }
    console.log('Role reçu:', localStorage.getItem('role'));
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

  getCompanyInfo(): Observable<{ companyName: string; address: string; tel: string; email: string; companyType: string; logoUrl: string; website: string }> {
    const headers = this.createHeaders();
    return this.http.get<{ companyName: string; address: string; tel: string; email: string; companyType: string; logoUrl: string; website: string }>(
      `${this.apiUrl}/company-info`,
      { headers }
    );
  }

  private createHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      console.log("the token is", token);
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
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

  getPartnerProfile(): Observable<{
    id: number;
    name: string;
    secondName: string;
    tel: string;
    email: string;
    companyName: string;
    address: string;
    companyType: string;
    website: string;
    businessLicense: string;
    crn: string;
    logoUrl: string;
  }> {
    const headers = this.createHeaders();
    return this.http.get<any>(`${this.apiUrl}/partner/profile`, { headers });
  }

  getEmployeeProfile(): Observable<{
    id: number;
    name: string;
    secondName: string;
    tel: string;
    email: string;
    post: string;
    department: string;
  }> {
    const headers = this.createHeaders();
    return this.http.get<any>(`${this.apiUrl}/employee/profile`, { headers });
  }

  updatePartnerProfile(partnerId: number, profile: any, logo?: File): Observable<any> {
    const formData = new FormData();
    Object.keys(profile).forEach(key => {
      if (key !== 'logoUrl') {
        formData.append(key, profile[key]);
      }
    });
    if (logo) {
      formData.append('logo', logo, logo.name);
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    });
    return this.http.put(`${this.apiUrl}/partner/${partnerId}/profile`, formData, { headers }).pipe(
      tap(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('name', profile.name || '');
          this.updateUserName(profile.name || null);
        }
      })
    );
  }

  updateEmployeeProfile(employeeId: number, profile: any): Observable<any> {
    const headers = this.createHeaders();
    return this.http.put(`${this.apiUrl}/employee/${employeeId}/profile`, profile, { headers }).pipe(
      tap(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('name', profile.name || '');
          this.updateUserName(profile.name || null);
        }
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('name');
    }
    this.updateUserName(null);
    this.updateUserRole(null); // Reset role
    this.router.navigate(['/signin']);
    console.log('🔴 Utilisateur déconnecté');
  }
}