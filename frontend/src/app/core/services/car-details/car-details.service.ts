// car-details.service.ts
import { Injectable, signal } from '@angular/core';
import { Car } from '../../../models/car.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CarDetailsService {
  private selectedCarSignal = signal<Car | null>(null);
  readonly selectedCar = this.selectedCarSignal.asReadonly();

  private baseURL = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  setSelectedCar(car: Car) {
    this.selectedCarSignal.set(car);
  }

  clearSelectedCar() {
    this.selectedCarSignal.set(null);
  }

  getCarReviews(carId: any): Observable<any> {
    return this.http.get(this.baseURL + "/cars/" + carId+"/client-review")
  }
}