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
  bookingData = {
    personalInfo: {
      name: 'Anastasiya Dobrota',
      email: 'dobrota@gmail.com',
      phone: '+38 111 111 11 11'
    },
    location: {
      pickup: 'Kyiv Hyatt Hotel',
      dropoff: 'Kyiv Hyatt Hotel'
    },
    dates: {
      pickup: {
        date: 'November 11',
        time: '10:00'
      },
      dropoff: {
        date: 'November 16',
        time: '16:00'
      }
    },
    car: {
      name: 'Audi A6 Quattro 2023',
      location: 'Ukraine, Kyiv',
      image: 'car-images/car 1/Rectangle 42.svg'
    },
    payment: {
      total: 900,
      deposit: 2000
    }
  };

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
      console.log("SLECTED CAR: ", this.selectedCar)
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

  confirmReservation() {
    // Implement reservation logic here
    console.log('Reservation confirmed', this.bookingData);
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
        id: 100,
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
    } else {
      console.log("Failed to book")
    }
  }
}
