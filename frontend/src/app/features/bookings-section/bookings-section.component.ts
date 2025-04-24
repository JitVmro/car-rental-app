import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingsCardComponent } from "../bookings-card/bookings-card.component";
import { BookingServiceService } from '../../core/services/booking-service/booking-service.service';
import { Booking, BookingState } from '../../models/booking.model';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { User } from '../../models/User';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings-section',
  imports: [CommonModule, BookingsCardComponent],
  templateUrl: './bookings-section.component.html',
  styleUrl: './bookings-section.component.css'
})
export class BookingsSectionComponent implements OnInit, OnDestroy {
  
  bookings: Booking[] = [];
  userId: User | null;
  filteredBookings: Booking[] = [];
  private bookingsSubscription: Subscription | null = null;

  active: number = 0;
  showPopup: boolean = false;
  showFeedback: boolean = false;
  bookingid: number = -1;
  rating: number = 0;

  constructor(
    public bookingService: BookingServiceService,
    private authService: AuthService
  ) {
    this.userId = this.authService.currentUserValue;
  }

  ngOnInit() {
    this.userId = this.authService.currentUserValue;
    if (this.userId) {
      this.bookingsSubscription = this.bookingService.getBookings(this.userId)
        .subscribe(bookings => {
          this.bookings = bookings;
          this.filterBookingsByActiveTab();
        });
    }
  }

  ngOnDestroy() {
    if (this.bookingsSubscription) {
      this.bookingsSubscription.unsubscribe();
    }
  }

  filterBookingsByActiveTab() {
    switch (this.active) {
      case 0:
        this.filteredBookings = this.bookings;
        break;
      case 1:
        this.filteredBookings = this.bookings.filter(booking => booking.state === BookingState.Reserved);
        break;
      case 2:
        this.filteredBookings = this.bookings.filter(booking => booking.state === BookingState.InProgress);
        break;
      case 3:
        this.filteredBookings = this.bookings.filter(booking => booking.state === BookingState.FinishedService);
        break;
      case 4:
        this.filteredBookings = this.bookings.filter(booking => booking.state === BookingState.FinishedBooking);
        break;
      case 5:
        this.filteredBookings = this.bookings.filter(booking => booking.state === BookingState.Cancelled);
        break;
      default:
        this.filteredBookings = this.bookings;
    }
  }

  setshowPopup(bookingid: number) {
    this.showPopup = true;
    this.bookingid = bookingid;
  }

  setshowFeedback(bookingid: number) {
    this.bookingid = bookingid;
    this.showFeedback = true;
  }

  HandleViewFeedback() {
    console.log("view feedback clicked");
  }
  
  HandleEditBooking() {
    console.log("edit booking clicked");
  }

  HandleCancelBooking() {
    this.showPopup = false;
    this.bookingService.cancelBooking(this.bookingid);
    console.log("cancel booking clicked");
  }

  HandleFeedbackSubmit() {
    this.showFeedback = false;
    this.bookingService.completeBooking(this.bookingid);
    console.log("feedback submitted");
  }

  setActive(index: number) {
    this.active = index;
    this.filterBookingsByActiveTab();
  }

  isActive(index: number) {
    return this.active === index;
  }

  setRating(star: number) {
    this.rating = star;
  }
}