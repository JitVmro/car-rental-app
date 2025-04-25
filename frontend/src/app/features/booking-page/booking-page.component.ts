import { Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarDetailsService } from '../../core/services/car-details/car-details.service';
import { Router } from '@angular/router';
import { Car } from '../../models/car.model';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { User } from '../../models/User';
import { BookingServiceService } from '../../core/services/booking-service/booking-service.service';
import { Booking, BookingState } from '../../models/booking.model';

@Component({
  selector: 'app-booking-page',
  templateUrl: './booking-page.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class BookingPageComponent implements OnInit {

  selectedCar: Car | null = null
  currentUser: User | null;

  constructor(
    private router: Router,
    private carService: CarDetailsService,
    private authService: AuthService,
    private bookingService: BookingServiceService
  ) {

    this.currentUser = this.authService.currentUserValue
    effect(() => {
      const car = this.carService.selectedCar();
      console.log(car);
      if (car) {
        this.selectedCar = car;
      }
    })

  }

  ngOnInit(): void {
    this.setSelectedCar()
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

  createBooking() {
    const user = this.authService.currentUserValue

    if (user && this.selectedCar) {
      const bookingObj: Booking = {
        id: this.bookingService.generateBookingId(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        carimg: this.selectedCar?.imageUrl,
        carname: this.selectedCar.brand + this.selectedCar.model,
        state: BookingState.Reserved,
      }
      this.bookingService.createBooking(bookingObj)
      this.router.navigate(['/bookings/new',{bId: bookingObj.id}])
    } else {
      console.log("Failed to book")
    }
  }
}
