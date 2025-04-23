import { Injectable } from '@angular/core';
import { Booking, BookingState } from '../../../models/booking.model';
import { User } from '../../../models/User';

@Injectable({
  providedIn: 'root'
})
export class BookingServiceService {
  private bookings: Booking[];

  constructor() {
    this.bookings = [
      {
        id: 1,
        user: {
          id: '2',
          name: 'Ravi Sharma',
          email: 'ravi.sharma@example.com',
          role: 'admin',
        },
        carimg: 'images/honda_city.jpg',
        carname: 'Honda City',
        state: BookingState.Reserved,
      },
      {
        id: 2,
        user: {
          id: '2',
          name: 'Anjali Mehta',
          email: 'anjali.mehta@example.com',
          role: 'admin',
        },
        carimg: 'images/hyundai_creta.jpg',
        carname: 'Hyundai Creta',
        state: BookingState.InProgress,
      },
      {
        id: 3,
        user: {
          id: '2',
          name: 'Aman Verma',
          email: 'aman.verma@example.com',
          role: 'admin',
        },
        carimg: 'images/maruti_brezza.jpg',
        carname: 'Maruti Brezza',
        state: BookingState.FinishedBooking,
      },
      {
        id: 4,
        user: {
          id: '2',
          name: 'Neha Sinha',
          email: 'neha.sinha@example.com',
          role: 'admin',
        },
        carimg: 'images/tata_nexon.jpg',
        carname: 'Tata Nexon',
        state: BookingState.Cancelled,
      },
      {
        id: 5,
        user: {
          id: '2',
          name: 'Karan Patel',
          email: 'karan.patel@example.com',
          role: 'admin',
        },
        carimg: 'images/mahindra_xuv300.jpg',
        carname: 'Mahindra XUV300',
        state: BookingState.FinishedService,
      },
    ];;
   }

   createBooking(booking:Booking){
    booking.id = this.bookings.length + 1;
    this.bookings.push(booking);
    
   }

   getBookings(user:User): Booking[] {
    console.log("Service Bookings",this.bookings);
    return this.bookings.filter(booking => booking.user.id === user.id);
   }

}
