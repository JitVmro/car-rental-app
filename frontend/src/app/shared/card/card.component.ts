import { Component, Input } from '@angular/core';
import { Car } from '../../models/car.model';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CarDetailsService } from '../../core/services/car-details/car-details.service';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private carService: CarDetailsService
  ) { }

  navigateToBookingConfirmation() {
    this.router.navigate(['cars/booking', { id: 47 }])
  }

  selectCar(event: Event) {
    event.preventDefault(); // Prevent any default anchor behavior
    event.stopPropagation(); // Prevent event bubbling
    this.carService.setSelectedCar(this.car);
    this.router.navigate(["/cars"]);
  }

  @Input() car!: Car;
}
