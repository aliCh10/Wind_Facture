import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private http: HttpClient) { }
  private apiUrl = 'http://localhost:8090/employees'; // Changed from /employee to /employees

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
      `${this.apiUrl}/${partnerId}`, // Corrected to /employees/{partnerId}
      employee,
      { headers: this.createHeaders() }
    );
  }

  // Récupérer un employé par son ID
  getEmployeeById(employeeId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${employeeId}`, // Corrected to /employees/{employeeId}
      { headers: this.createHeaders() }
    );
  }

  // Récupérer tous les employés
  getAllEmployees(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { headers: this.createHeaders() }); // Corrected to /employees
  }

  // Mettre à jour un employé
  updateEmployee(employeeId: number, employee: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${employeeId}`, // Corrected to /employees/{employeeId}
      employee,
      { headers: this.createHeaders() }
    );
  }

  // Supprimer un employé par ID
  deleteEmployee(employeeId: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${employeeId}`, // Corrected to /employees/{employeeId}
      { headers: this.createHeaders() }
    );
  }

  // Changer le mot de passe d'un employé
  changePassword(employeeId: number, newPassword: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/${employeeId}/change-password`, // Corrected to /employees/{employeeId}/change-password
      null,
      {
        headers: this.createHeaders(),
        params: { newPassword },
      }
    );
  }

searchEmployees(searchTerm: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/search`, {
    headers: this.createHeaders(),
    params: { q: searchTerm }
  });
}
}
