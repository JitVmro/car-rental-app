import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BookingsCardComponent } from "../bookings-card/bookings-card.component";
import { BookingServiceService } from '../../core/services/booking-service/booking-service.service';
import { Booking } from '../../models/booking.model';
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

  constructor(private bookingService:BookingServiceService,private authService:AuthService){
    this.userId= this.authService.currentUserValue;
    if(this.userId)
    this.bookings=this.bookingService.getBookings(this.userId);
  
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
  }

  isActive(index: number) {
    return this.active === index;
  }
}
