import { Injectable } from '@angular/core';
import { Booking, BookingState } from '../../../models/booking.model';
import { User } from '../../../models/User';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookingServiceService {
  private bookingsSubject: BehaviorSubject<Booking[]>;
  public bookings$: Observable<Booking[]>;

  constructor() {
    const initialBookings = [
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
    ];
    
    this.bookingsSubject = new BehaviorSubject<Booking[]>(initialBookings);
    this.bookings$ = this.bookingsSubject.asObservable();
  }

  createBooking(booking: Booking) {
    const currentBookings = this.bookingsSubject.value;
    booking.id = currentBookings.length + 1;
    
    // Create a new array with the new booking
    const updatedBookings = [...currentBookings, booking];
    
    // Emit the new array
    this.bookingsSubject.next(updatedBookings);
  }

  getBookings(user: User): Observable<Booking[]> {
    return this.bookings$.pipe(
      map(bookings => bookings.filter(booking => booking.user.id === user.id))
    );
  }

  cancelBooking(bookingId: number): void {
    const currentBookings = this.bookingsSubject.value;
    
    // Create a new array without the cancelled booking
    const updatedBookings = currentBookings.map(booking => {
      if (booking.id === bookingId) {
        return { ...booking, state: BookingState.Cancelled };
      }
      return booking;
    });
    
    // Emit the new array
    this.bookingsSubject.next(updatedBookings);
  }

  completeBooking(bookingId: number): void {
    const currentBookings = this.bookingsSubject.value;
    
    // Create a new array without the cancelled booking
    const updatedBookings = currentBookings.map(booking => {
      if (booking.id === bookingId) {
        return { ...booking, state: BookingState.FinishedBooking };
      }
      return booking;
    });
    
    // Emit the new array
    this.bookingsSubject.next(updatedBookings);
  }

  getAllBookings(): Observable<Booking[]> {
    return this.bookings$;
  }
}