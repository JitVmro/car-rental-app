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
  @Output() showFeedBackEvent = new EventEmitter<void>();
  @Output() cancelBookingEvent = new EventEmitter<number>();
  @Output() viewBookingEvent = new EventEmitter<void>();
  @Output() editBookingEvent = new EventEmitter<void>();

  onshowFeedBackEvent() {
    this.showFeedBackEvent.emit();
  }
  onCancelBookingEvent() {
    this.cancelBookingEvent.emit(this.booking.id);
  }

  onViewBookingEvent() {
    this.viewBookingEvent.emit();
  }
  onEditBookingEvent() {
    this.editBookingEvent.emit();
  }
  


  
}
