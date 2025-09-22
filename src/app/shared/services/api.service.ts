import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  // GET con parámetros opcionales
  get<T>(endpoint: string, params?: any, headers?: any): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      params: params ? new HttpParams({ fromObject: params }) : undefined,
      headers: headers ? new HttpHeaders(headers) : undefined
    });
  }

  // POST
  post<T>(endpoint: string, body: any, headers?: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, {
      headers: headers ? new HttpHeaders(headers) : undefined
    });
  }

  // PUT
  put<T>(endpoint: string, body: any, headers?: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, {
      headers: headers ? new HttpHeaders(headers) : undefined
    });
  }

  // PATCH
  patch<T>(endpoint: string, body: any, headers?: any): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, body, {
      headers: headers ? new HttpHeaders(headers) : undefined
    });
  }

  // DELETE
  delete<T>(endpoint: string, params?: any, headers?: any): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, {
      params: params ? new HttpParams({ fromObject: params }) : undefined,
      headers: headers ? new HttpHeaders(headers) : undefined
    });
  }
}
