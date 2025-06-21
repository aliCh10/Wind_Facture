import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SystemService {
  private apiUrl = 'http://localhost:8090/system';

  constructor(private http: HttpClient) {}

  private createHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  getPartners(page: number, size: number, sort: string, name?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
    if (name) {
      params = params.set('name', name);
    }
    return this.http.get(`${this.apiUrl}/partners`, { headers: this.createHeaders(), params });
  }

  validatePartner(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate-partner/${id}`, {}, { headers: this.createHeaders() });
  }

  deletePartner(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-partner/${id}`, { headers: this.createHeaders() });
  }
}