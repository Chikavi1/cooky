import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';

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

   getCurrencyFromLatLng(lat: number, lng: number): Observable<string | null> {
    // 1️⃣ Usamos la API de geocoding inverso de OpenStreetMap (gratis)
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

    return this.http.get<any>(url).pipe(
      switchMap(res => {
        const countryCode = res.address?.country_code?.toUpperCase();
        if (!countryCode) return of(null);

        // 2️⃣ Usamos la API de restcountries.com para obtener la currency
        const countryUrl = `https://restcountries.com/v3.1/alpha/${countryCode}`;
        return this.http.get<any>(countryUrl).pipe(
          map(countryData => {
            const currencies = countryData[0]?.currencies;
            if (!currencies) return null;

            // Retornamos la primera currency
            const currencyCode = Object.keys(currencies)[0];
            return currencyCode;
          })
        );
      })
    );
  }
}
