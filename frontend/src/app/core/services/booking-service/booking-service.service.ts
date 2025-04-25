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

  private singleBookingSubject: BehaviorSubject<Booking>;
  public singleBooking$: Observable<Booking>;

  currentBooking: Booking = {
    id: 0,
    user: {
      id: '',
      name: '',
      email: '',
      role: ''
    },
    carimg: '',
    carname: '',
    state: BookingState.FinishedService
  }

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

    this.singleBookingSubject = new BehaviorSubject<Booking>(this.currentBooking);
    this.singleBooking$ = this.singleBookingSubject.asObservable();
  }

  createBooking(booking: Booking) {
    const currentBookings = this.bookingsSubject.value;

    // Create a new array with the new booking
    const updatedBookings = [...currentBookings, booking];

    // Emit the new array
    this.bookingsSubject.next(updatedBookings);
  }

  generateBookingId():number{
    const currentBookings = this.bookingsSubject.value;
    return currentBookings.length + 1;
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

  getBooking(id: number): Observable<Booking> {
    const currentBookings = this.bookingsSubject.value;
    const booking = currentBookings.find((b) => b.id === id);
    if (booking) {
      this.singleBookingSubject.next(booking);
    }
    return this.singleBooking$;
  }

  saveBooking(updatedBooking: Booking) {
    const currentBookings = this.bookingsSubject.value;
    const bookingIndex = currentBookings.findIndex((b) => b.id === updatedBooking.id)
    currentBookings[bookingIndex] = updatedBooking;
  }
}