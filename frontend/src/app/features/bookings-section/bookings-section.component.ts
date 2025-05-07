import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingsCardComponent } from "../bookings-card/bookings-card.component";
import { BookingServiceService } from '../../core/services/booking-service/booking-service.service';
import { Booking, BookingState, Location } from '../../models/booking.model';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { User } from '../../models/User';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Feedback } from '../../models/feedback';
import { bookingFeedback } from '../../models/bookingFeedback';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environment/environment';


@Component({
  selector: 'app-bookings-section',
  imports: [CommonModule, BookingsCardComponent, FormsModule, HttpClientModule],
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
  bookingid: string = "";
  carId: string = "";
  carName: string = '';
  rating: number = 0;
  congo: boolean = false;
  reviewText: string = '';


  currentFeedback: bookingFeedback = {
    bookingId: '',
    carId: '',
    comment: '',
    rating: '0',
  }

  currentBookingID: any;
  latestBooking!: Booking;
  baseUrl = environment.apiUrl;
  createFeedbackUrl = this.baseUrl + '/feedbacks';

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
        .getBooking((this.currentBookingID))
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


    //Getting the bookings of the current user
    this.userId = this.authService.currentUserValue;
    if (this.userId?.id) {
      const token = localStorage.getItem('auth_token')
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });
      const URL: string = this.baseUrl +  `/bookings/${this.userId.id}`;

      this.http.get(URL, { headers }).subscribe({
        next: (response: any) => {
          this.bookings = this.mapBookings(response.bookings);
          console.log(response.bookings);

          this.filterBookingsByActiveTab();
        },
        error: (error) => {
          console.error('Error fetching bookings:', error);
        },

      })
    }
  }




  ngOnDestroy() {
    if (this.bookingsSubscription) {
      this.bookingsSubscription.unsubscribe();
    }
  }


  mapBookings(bookings: any[]): Booking[] {
    return bookings.map((booking: any): Booking => {
      const pickupDateTime = new Date(booking.pickupDateTime);
      const dropOffDateTime = new Date(booking.dropOffDateTime);
      
      // Date parts (as Date objects with time 00:00:00)
      const pickupDate = new Date(pickupDateTime.getFullYear(), pickupDateTime.getMonth(), pickupDateTime.getDate());
      const dropOffDate = new Date(dropOffDateTime.getFullYear(), dropOffDateTime.getMonth(), dropOffDateTime.getDate());
      
      // Time parts (as "HH:mm" strings)
      const pickupTime = pickupDateTime.toISOString().substring(11, 16); // "22:09"
      const dropOffTime = dropOffDateTime.toISOString().substring(11, 16); // "09:30"
      

      return {
        id: booking._id,
        carId: booking.carId,
        userId: booking.clientId,
        carimg: booking.carImg,
        carname: booking.carName,
        state: booking.status as BookingState,
        startDate: pickupDate,
        endDate: dropOffDate,
        startTime: pickupTime,
        endTime: dropOffTime,
        pickuplocation: booking.pickupLocationId as Location,
        droplocation: booking.dropOffLocationId as Location
      };
    });
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



  setshowPopup(bookingid: string) {
    this.showPopup = true;
    this.bookingid = bookingid;
  }

  closeCongo() {
    this.congo = false;
  }

  setshowFeedback([bookingid,carId,carName]: string[]) {
    this.bookingid = bookingid;
    this.carId = carId;
    this.carName = carName;
    this.showFeedback = true;
  }

  HandleViewFeedback(bookingid: string) {
    this.bookingid = bookingid;
    console.log("view feedback clicked");
  }

  HandleEditBooking(bookingid: string) {
    this.bookingid = bookingid;
    this.router.navigate(['bookings/edit', { bId: this.bookingid }])
    console.log("edit booking clicked");
  }

  HandleCancelBooking() {
    this.showPopup = false;
    this.bookingService.cancelBooking(this.bookingid);
    console.log("cancel booking clicked");
  }

  // Headers
  token: string | null = localStorage.getItem('auth_token');
  headers = new HttpHeaders({
    'Authorization': `Bearer ${this.token}`,
    'Content-Type': 'application/json'
  });

  HandleFeedbackSubmit() {
    this.showFeedback = false;
    this.bookingService.completeBooking(this.bookingid);
    this.currentFeedback.bookingId = this.bookingid.toString();
    //this.currentFeedback.userId = this.userId?.id.toString() ?? '';
    this.currentFeedback.carId = this.carId;
    this.currentFeedback.comment = this.reviewText;
    this.currentFeedback.rating = this.rating.toString();
    console.log(this.currentFeedback);

  

    this.http.post(this.createFeedbackUrl, this.currentFeedback, { headers: this.headers }).subscribe( (response) => { console.log(response);window.location.reload(); });
    


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