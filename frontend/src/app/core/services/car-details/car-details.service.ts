// car-details.service.ts
import { Injectable, signal } from '@angular/core';
import { Car } from '../../../models/car.model';

@Injectable({
  providedIn: 'root'
})
export class CarDetailsService {
  private selectedCarSignal = signal<Car | null>(null);
  readonly selectedCar = this.selectedCarSignal.asReadonly();

  setSelectedCar(car: Car) {
    this.selectedCarSignal.set(car);
  }

  clearSelectedCar() {
    this.selectedCarSignal.set(null);
  }
}