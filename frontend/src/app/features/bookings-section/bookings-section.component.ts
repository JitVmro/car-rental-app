import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingsCardComponent } from "../bookings-card/bookings-card.component";
import { BookingServiceService } from '../../core/services/booking-service/booking-service.service';
import { Booking, BookingState } from '../../models/booking.model';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { User } from '../../models/User';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Feedback } from '../../models/feedback';
import { bookingFeedback } from '../../models/bookingFeedback';
import { HttpClient,HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-bookings-section',
  imports: [CommonModule, BookingsCardComponent, FormsModule,HttpClientModule],
  templateUrl: './bookings-section.component.html',
  styleUrl: './bookings-section.component.css'
})
export class BookingsSectionComponent implements OnInit, OnDestroy {

  bookings: Booking[] = [];
  userId: User | null;
  filteredBookings: Booking[] = [];

  private bookingsSubscription: Subscription | null = null;
  private latestBookingSubscription: Subscription | null = null;

  active: number = 0;
  showPopup: boolean = false;
  showFeedback: boolean = false;
  bookingid: number = -1;
  bookingName:string = '';
  rating: number = 0;
  congo: boolean = false;
  reviewText: string = '';

  currentFeedback:bookingFeedback = {
    bookingId: '',
    clientId: '',
    carId: '',
    feedbackText: '',
    rating: 0,}

  currentBookingID: any;
  latestBooking!: Booking;
  createFeedbackUrl = 'https://trpcstt2r6.execute-api.eu-west-2.amazonaws.com/dev/feedbacks';

  constructor(
    public bookingService: BookingServiceService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {
    this.userId = this.authService.currentUserValue;
    console.log(this.userId?.id);
  }

  ngOnInit() {
    this.currentBookingID = this.route.snapshot.paramMap.get('bId');
    if (this.currentBookingID) {
      this.latestBookingSubscription = this.bookingService
        .getBooking(parseInt(this.currentBookingID))
        .subscribe({
          next: (value) => {
            this.latestBooking = value;
          },
          error: (error) => {
            console.error('Error fetching booking:', error);
          }
        });
    }

    this.route.url.subscribe(urlSegments => {
      if (urlSegments[1].path === "new") {
        this.congo = true;
      }
    });

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

  closeCongo() {
    this.congo = false;
  }

  setshowFeedback(bookingid: number) {
    this.bookingid = bookingid;
    this.showFeedback = true;
    this.bookingService.getBookingCarName(bookingid).subscribe(carname => this.bookingName = carname);
    console.log(this.bookingName);
  }

  HandleViewFeedback(bookingid: number) {
    this.bookingid = bookingid;
    console.log("view feedback clicked");
  }

  HandleEditBooking(bookingid: number) {
    this.bookingid = bookingid;
    this.router.navigate(['bookings/edit', { bId: this.bookingid }])
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
    this.currentFeedback.bookingId = this.bookingid.toString();
    this.currentFeedback.clientId = this.userId?.id.toString() ?? '';
    this.currentFeedback.carId = this.bookingName;
    this.currentFeedback.feedbackText = this.reviewText;
    this.currentFeedback.rating = this.rating;
    console.log(this.currentFeedback);

    this.http.post(this.createFeedbackUrl, this.currentFeedback).subscribe(response => {console.log(response);});


  }

  setActive(index: number) {
    this.active = index;
    this.filterBookingsByActiveTab();
  }

  isActive(index: number) {
    return this.active === index;
  }

  setRating(star: number) {
    console.log(star);
    this.rating = star;
  }


}