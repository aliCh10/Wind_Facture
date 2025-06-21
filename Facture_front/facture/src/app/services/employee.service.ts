import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://localhost:8090/employees';

  constructor(private http: HttpClient) { }

  private createHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const token = localStorage.getItem('token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // Ajouter un employé
  addEmployee(partnerId: number, employee: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${partnerId}`,
      employee,
      { headers: this.createHeaders() }
    );
  }

  // Récupérer un employé par son ID
  getEmployeeById(employeeId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${employeeId}`,
      { headers: this.createHeaders() }
    );
  }

  // Récupérer tous les employés avec pagination
  getAllEmployees(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.apiUrl}`, {
      headers: this.createHeaders(),
      params
    });
  }

  // Mettre à jour un employé
  updateEmployee(employeeId: number, employee: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${employeeId}`,
      employee,
      { headers: this.createHeaders() }
    );
  }

  // Supprimer un employé par ID
  deleteEmployee(employeeId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${employeeId}`,
      { headers: this.createHeaders() }
    );
  }

  // Changer le mot de passe d'un employé
  changePassword(employeeId: number, newPassword: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${employeeId}/change-password`,
      null,
      {
        headers: this.createHeaders(),
        params: { newPassword },
      }
    );
  }

  // Rechercher des employés par nom avec pagination
  searchEmployees(searchTerm: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('name', searchTerm)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.post(`${this.apiUrl}/search`, null, {
      headers: this.createHeaders(),
      params
    });
  }
}