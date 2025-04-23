import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

enum BookingState {
  FinishedService = 'FinishedService',
  Cancelled = 'Cancelled',
  InProgress = 'InProgress',
  FinishedBooking = 'FinishedBooking',
  Reserved = 'Reserved',
}

@Component({
  selector: 'app-bookings-card',
  imports: [CommonModule],
  templateUrl: './bookings-card.component.html',
  styleUrl: './bookings-card.component.css'
})
export class BookingsCardComponent {
  BookingState = BookingState;
  state:BookingState = BookingState.FinishedService;
}
