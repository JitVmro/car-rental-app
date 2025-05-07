import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Car } from '../../../models/car.model';

@Injectable({
  providedIn: 'root'
})
export class CarsService {
  private baseURL = 'https://trpcstt2r6.execute-api.eu-west-2.amazonaws.com/dev';
  constructor(
    private http: HttpClient
  ) { }

  getCars(): Observable<any> {
    return this.http.get(this.baseURL + "/cars")
  }
  getPopularCars(): Observable<any> {
    return this.http.get(this.baseURL + "/cars/popular")
  }







  getCarById(carId: string): Observable<Car> {
    return this.http.get<Car>(this.baseURL + "/cars/" + carId);
  }
}