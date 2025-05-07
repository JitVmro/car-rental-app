import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CarsService {
  private baseURL = environment.apiUrl;
  constructor(
    private http: HttpClient
  ) { }

  getCars(): Observable<any> {
    return this.http.get(this.baseURL + "/cars")
  }

  getPopularCars(): Observable<any> {
    return this.http.get(this.baseURL + "/cars/popular")
  }

  getFilteredCar(filters = {}): Observable<any> {
    // Initialize HttpParams object
    let params = new HttpParams();

    // Add each filter parameter to the params if it exists
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Convert Date objects to ISO strings if needed
        if (value instanceof Date) {
          params = params.append(key, value.toISOString());
        } else {
          params = params.append(key, value.toString());
        }
      }
    });

    // Return the HTTP request with the parameters
    return this.http.get(`${this.baseURL}/cars`, { params });
  }

}