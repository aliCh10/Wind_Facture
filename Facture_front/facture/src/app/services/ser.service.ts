import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Service, ServiceDTO } from '../models/service';
import { Page } from '../models/Client';

@Injectable({ providedIn: 'root' })
export class SerService {
  private apiUrl = 'http://localhost:8093/services';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      message = `Error: ${error.error.message}`;
    } else if (error.error?.error) {
      message = error.error.error; // Backend error message (e.g., "Service not found")
    } else {
      message = error.status === 404 ? 'Service not found' : `Code: ${error.status}, Message: ${error.message}`;
    }
    console.error(message);
    return throwError(() => new Error(message));
  }

  getAllServices(page: number, size: number): Observable<Page<Service>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Service>>(this.apiUrl, { headers: this.getHeaders(), params })
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

  searchServicesByName(name: string, page: number, size: number): Observable<Page<Service>> {
    const params = new HttpParams()
      .set('name', name.trim())
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Service>>(`${this.apiUrl}/search-by-name`, { headers: this.getHeaders(), params })
      .pipe(catchError(this.handleError));
  }

  searchServices(serviceDTO: ServiceDTO, page: number, size: number): Observable<Page<Service>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.post<Page<Service>>(`${this.apiUrl}/search`, serviceDTO, { headers: this.getHeaders(), params })
      .pipe(catchError(this.handleError));
  }
}