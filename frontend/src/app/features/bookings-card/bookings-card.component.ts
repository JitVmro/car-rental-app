import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Output() showFeedBackEvent = new EventEmitter<number>();
  @Output() cancelBookingEvent = new EventEmitter<number>();
  @Output() viewBookingEvent = new EventEmitter<number>();
  @Output() editBookingEvent = new EventEmitter<number>();

  onshowFeedBackEvent() {
    this.showFeedBackEvent.emit(this.booking.id);
  }
  
  onCancelBookingEvent() {
    this.cancelBookingEvent.emit(this.booking.id);
  }

  onViewBookingEvent() {
    this.viewBookingEvent.emit(this.booking.id);
  }
  onEditBookingEvent() {
    this.editBookingEvent.emit(this.booking.id);
  }
  


  
}
