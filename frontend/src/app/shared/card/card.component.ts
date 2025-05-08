import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Car } from '../../models/car.model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CarDetailsService } from '../../core/services/car-details/car-details.service';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { CarsService } from '../../core/services/cars/cars.service';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Output() loginPopup: EventEmitter<void> = new EventEmitter<void>();
  constructor(
    private router: Router,
    private carDetailService: CarDetailsService,
    private authService: AuthService,
    private carsServices: CarsService
  ) { }

  navigateToBookingConfirmation() {
    if (this.authService.isLoggedIn()) {
      this.carDetailService.setSelectedCar(this.car)
      this.router.navigate(['cars/booking', { carId: this.car.carId }])
    }
    else {
      console.log("Please Login");
      this.loginPopup.emit();
    }
  }

  selectCar(event: Event) {
    event.preventDefault(); // Prevent any default anchor behavior
    event.stopPropagation(); // Prevent event bubbling
    this.carsServices.getCarById(this.car.carId).subscribe((carResponse)=>{
      this.carDetailService.setSelectedCar(carResponse);
    })
    this.router.navigate(["/cars"]);
  }

  @Input() car!: Car;
}
