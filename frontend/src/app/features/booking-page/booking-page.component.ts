import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-page',
  templateUrl: './booking-page.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class BookingPageComponent {
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
}
