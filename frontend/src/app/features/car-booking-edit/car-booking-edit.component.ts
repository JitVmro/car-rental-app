import { Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarDetailsService } from '../../core/services/car-details/car-details.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Car } from '../../models/car.model';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { User } from '../../models/User';
import { BookingServiceService } from '../../core/services/booking-service/booking-service.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { Booking } from '../../models/booking.model';

@Component({
  standalone: true,
  selector: 'app-car-booking-edit',
  imports: [CommonModule, FormsModule],
  templateUrl: './car-booking-edit.component.html',
  styleUrl: './car-booking-edit.component.css'
})
export class CarBookingEditComponent implements OnInit {
  selectedCar: Car | null = null
  currentUser: User | null;
  daysCaluclated: number = 0;
  currentBookingID!: string | null;
  currentBookingInfo!: Booking;

  private subscription!: Subscription;

  constructor(
    private router: Router,
    private carService: CarDetailsService,
    private authService: AuthService,
    private bookingService: BookingServiceService,
    private route: ActivatedRoute
  ) {
    this.currentUser = this.authService.currentUserValue;
    effect(() => {
      const car = this.carService.selectedCar();
      console.log(car);
      if (car) {
        this.selectedCar = car;
      }
      console.log("SLECTED CAR: ", this.selectedCar)
    })
  }

  ngOnInit(): void {
    this.currentBookingID = this.route.snapshot.paramMap.get('bId');

    if (this.currentBookingID) {
      this.subscription = this.bookingService
        .getBooking(parseInt(this.currentBookingID))
        .subscribe({
          next: (value) => {
            this.currentBookingInfo = value;
            console.log("Booking info:", this.currentBookingInfo);
          },
          error: (error) => {
            console.error('Error fetching booking:', error);
          }
        });
    }

    this.setSelectedCar()
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  setSelectedCar() {
    const car = this.carService.selectedCar();
    if (car) {
      this.selectedCar = car;
    }
  }

  changeLocation() {
    // Implement location change logic
  }

  changeDates() {
    // Implement dates change logic
  }
}
