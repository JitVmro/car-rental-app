import { Injectable } from '@angular/core';
import { Booking, BookingState,Location } from '../../../models/booking.model';
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
    id: "6818854fe6df73d3ed28231e",
    userId:' ',
    carimg: '',
    carname: '',
    state: BookingState.FinishedService,
    startDate: new Date(),
    endDate: new Date(),
    startTime: '',
    endTime: '',
    pickuplocation: Location.Kyiv,
    droplocation: Location.Kyiv
  }

  constructor() {
    const initialBookings: Booking[] = [];

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

  generateBookingId(): number {
    const currentBookings = this.bookingsSubject.value;
    return currentBookings.length + 1;
  }

  getBookings(user: User): Observable<Booking[]> {
    return this.bookings$.pipe(
      map(bookings => bookings.filter(booking => booking.userId === user.id))
    );
  }

  cancelBooking(bookingId: string): void {
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

  completeBooking(bookingId: string): void {
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

  getBooking(id: string): Observable<Booking> {
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

  getBookingCarName(bookingId: string): Observable<string> {
    return this.bookings$.pipe(
      map(bookings => {
        const booking = bookings.find(b => b.id === bookingId);
        return booking?.carname ?? 'Unknown Booking';
      })
    );
  }
  
  
}


