import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Service, ServiceDTO } from '../models/service';

@Injectable({ providedIn: 'root' })
export class SerService {
  private apiUrl = 'http://localhost:8093/services';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return token ? headers.set('Authorization', `Bearer ${token}`) : headers;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      message = `Erreur: ${error.error.message}`;
    } else {
      message = error.status === 404 ? 'Service non trouvé' : `Code: ${error.status}, Message: ${error.message}`;
    }
    console.error(message);
    return throwError(() => new Error(message));
  }


  getAllServices(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  getServiceById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  createService(service: ServiceDTO): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, service, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  updateService(id: number, service: ServiceDTO): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, service, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }
}
