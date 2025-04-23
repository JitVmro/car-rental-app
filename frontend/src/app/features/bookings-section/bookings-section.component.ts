import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BookingsCardComponent } from "../bookings-card/bookings-card.component";
import { BookingServiceService } from '../../core/services/booking-service/booking-service.service';
import { Booking, BookingState } from '../../models/booking.model';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { User } from '../../models/User';

@Component({
  selector: 'app-bookings-section',
  imports: [CommonModule, BookingsCardComponent],
  templateUrl: './bookings-section.component.html',
  styleUrl: './bookings-section.component.css'
})
export class BookingsSectionComponent {
  
  bookings:Booking[]=[];
  userId:User|null;
  filteredBookings: Booking[] = [];

  constructor(private bookingService:BookingServiceService,private authService:AuthService){
    this.userId= this.authService.currentUserValue;
    if(this.userId){
      this.bookings=this.bookingService.getBookings(this.userId);
      this.filteredBookings=this.bookings
    }
  
  }

  ngOnInit() {
    this.userId = this.authService.currentUserValue;
    if (this.userId) {
      this.bookings = this.bookingService.getBookings(this.userId);
    }
  }


  active: number = 0;

  setActive(index: number) {
    this.active = index;
    if (index === 0) {
      this.filteredBookings = this.bookings;
    }
    
    if (index === 1) {
      this.filteredBookings = this.bookings.filter(booking => booking.state === BookingState.Reserved);
    }
    if (index === 2) {
      this.filteredBookings = this.bookings.filter(booking => booking.state === BookingState.InProgress);
    }
    if (index === 3) {
      this.filteredBookings = this.bookings.filter(booking => booking.state === BookingState.FinishedService);
    } 
    if (index === 4) {
      this.filteredBookings = this.bookings.filter(booking => booking.state === BookingState.FinishedBooking);
    }
  }

  isActive(index: number) {
    return this.active === index;
  }
}
