import { Component, Input } from '@angular/core';
import { CarDetailComponent } from '../../shared/car-detail/car-detail.component';
import { Car, ClimateControlOption, FuelType, GearBoxType, Status } from '../../models/car';

@Component({
  selector: 'app-cars-page',
  imports: [CarDetailComponent],
  templateUrl: './cars-page.component.html',
  styleUrl: './cars-page.component.css'
})
export class CarsPageComponent {
  title = 'frontend';

  currentCar: Car = {
    carId: '42',
    carRating: '',
    climateControlOption: ClimateControlOption.NONE,
    engineCapacity: '',
    fuelConsumption: '',
    fuelType: FuelType.PETROL,
    gearBoxType: GearBoxType.MANUAL,
    images: [
      'car-images/car 1/Rectangle 41.svg',
      'car-images/car 1/Rectangle 42.svg',
      'car-images/car 1/Rectangle 43.svg',
    ],
    location: '',
    model: '',
    passengerCapacity: '',
    pricePerDay: '400',
    serviceRating: '',
    status: Status.AVAILABLE
  }

  openCarDetailsPopup() {
    document.getElementById("carDetailPopup")?.classList.remove("hidden");
  }


}
