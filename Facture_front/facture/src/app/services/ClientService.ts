import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Client, Page } from '../models/Client';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly apiUrl = 'http://localhost:8092/clients';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  getAllClients(page: number, size: number): Observable<Page<Client>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Client>>(this.apiUrl, { headers: this.getHeaders(), params }).pipe(
      catchError(error => throwError(() => new Error(error.error?.error || 'Error fetching clients')))
    );
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => new Error(error.error?.error || 'Error fetching client')))
    );
  }

  addClient(client: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => new Error(error.error?.error || 'Error creating client')))
    );
  }

  updateClient(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => new Error(error.error?.error || 'Error updating client')))
    );
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() }).pipe(
      catchError(error => throwError(() => new Error(error.error?.error || 'Error deleting client')))
    );
  }

  searchClients(term: string, page: number, size: number): Observable<Page<Client>> {
    const criteria: Partial<Client> = { clientName: term.trim() };
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.post<Page<Client>>(`${this.apiUrl}/search`, criteria, { headers: this.getHeaders(), params }).pipe(
      catchError(error => throwError(() => new Error(error.error?.error || 'Error searching clients')))
    );
  }
}