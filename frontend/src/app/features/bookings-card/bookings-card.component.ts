import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Booking, BookingState } from '../../models/booking.model';


@Component({
  selector: 'app-bookings-card',
  imports: [CommonModule],
  templateUrl: './bookings-card.component.html',
  styleUrl: './bookings-card.component.css'
})
export class BookingsCardComponent {

  BookingState = BookingState;
  state:BookingState = BookingState.FinishedService;
  
  @Input() booking!:Booking;

  
}
