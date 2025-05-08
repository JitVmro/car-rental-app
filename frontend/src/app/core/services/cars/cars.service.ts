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

  getFilteredCar(filters: any): Observable<any> {
    // Initialize HttpParams object
    let params = new HttpParams();
    // Add each filter parameter to the params if it exists
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Convert Date objects to ISO strings if needed
        if (value instanceof Date) {
          params = params.set(key, value.toISOString());
        } else {
          params = params.set(key, value.toString());
        }
      }
    });
    // Log the final URL that will be called (for debugging)
    const urlWithParams = `${this.baseURL}/cars?${params.toString()}`;
    // Make the HTTP request
    return this.http.get(urlWithParams)
  }

  getCarById(carId: string): Observable<any> {
    return this.http.get(this.baseURL + "/cars/" + carId)
  }
}