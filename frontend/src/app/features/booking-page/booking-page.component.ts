import { Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Car } from '../../models/car.model';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { User } from '../../models/User';
import { BookingServiceService } from '../../core/services/booking-service/booking-service.service';
import { Booking, BookingState, createBooking, Location } from '../../models/booking.model';
import { DatePickerComponent } from "../../shared/date-picker/date-picker.component";
import { CarFilterService } from '../../core/services/car-filter.service';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { CarsService } from '../../core/services/cars/cars.service';

@Component({
  selector: 'app-booking-page',
  templateUrl: './booking-page.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerComponent]
})
export class BookingPageComponent implements OnInit {

  selectedCar!: Car;
  currentUser: User | null;

  startDate!: Date;
  endDate!: Date;
  startTime!: string;
  endTime!: string;
  Location!: Location;
  pickuplocation!: Location;
  droplocation!: Location;
  showLocationPopup: boolean = false;

  datePickerDisplayStatus: boolean = false;
  currentCarID: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    // private carFilterService: CarFilterService,
    private carsService: CarsService,
    private authService: AuthService,
    private bookingService: BookingServiceService,
    private http: HttpClient
  ) {
    this.currentUser = this.authService.currentUserValue;
    this.pickuplocation = Location.Kyiv;
    this.droplocation = Location.Kyiv;
  }

  ngOnInit(): void {
    this.currentCarID = this.route.snapshot.paramMap.get('carId');
    if (this.currentCarID) {
      this.loadCarById(this.currentCarID)
    }
  }

  loadCarById(carId: string) {
    this.carsService.getCarById(carId).subscribe(((car) => {
      this.selectedCar = car;
      console.log(this.selectedCar)
    }))
  }

  toggleDatePicker() {
    this.datePickerDisplayStatus = !this.datePickerDisplayStatus;
  }

  changeLocation() {
    // Implement location change logic
  }

  changeDates() {
    // Implement dates change logic
  }

  createBooking() {
    const user = this.authService.currentUserValue
    console.log(user?.id);

    if (user && this.selectedCar) {
      const bookingObj: Booking = {
        id: "" + this.bookingService.generateBookingId(),
        carId: this.selectedCar.carId,
        userId: user.id,
        carimg: this.selectedCar?.imageURL,
        carname: this.selectedCar.brand + this.selectedCar.model,
        state: BookingState.Reserved,
        startDate: this.startDate,
        endDate: this.endDate,
        startTime: this.startTime,
        endTime: this.endTime,
        pickuplocation: this.pickuplocation,
        droplocation: this.droplocation,

      }
      this.bookingService.createBooking(bookingObj)
      this.router.navigate(['/bookings/new', { bId: bookingObj.id }])
      console.log(bookingObj);

    } else {
      console.log("Failed to book")
    }
  }


  // Headers
  token: string | null = localStorage.getItem('auth_token')
  headers = new HttpHeaders({
    'Authorization': `Bearer ${this.token}`,
    'Content-Type': 'application/json'
  });


  formatDateTime(date: Date, time: string): string {

    // Extract YYYY-MM-DD from the Date object
    const datePart = date.toISOString().split('T')[0];

    // Ensure time is in HH:mm format
    if (!/^\d{2}:\d{2}$/.test(time)) throw new Error("Invalid time format");

    // Construct combined string
    const combined = `${datePart}T${time}:00`;

    // Create new Date object and return ISO string
    return new Date(combined).toISOString();
  }


  postBooking() {
    const user = this.authService.currentUserValue;
    console.log("DATA", this.startDate, this.startTime, this.endDate, this.endTime);


    if (user && this.selectedCar) {
      const bookingObj: createBooking = {
        carId: this.selectedCar.carId,
        clientId: user.id,
        carImg: this.selectedCar.images[0],
        carName: this.selectedCar.model,
        pickupDateTime: this.formatDateTime(this.startDate, this.startTime),
        dropOffDateTime: this.formatDateTime(this.endDate, this.endTime),

        pickupLocationId: this.pickuplocation,
        dropOffLocationId: this.droplocation,
      }
      console.log(bookingObj);

      this.http.post('https://trpcstt2r6.execute-api.eu-west-2.amazonaws.com/dev/bookings', bookingObj, { headers: this.headers }).subscribe({
        next: (response: any) => {
          console.log('Booking created successfully:', response.message, response.bookingNumber);
          this.router.navigate(['/bookings/new', { bId: bookingObj.carId }])
          console.log(bookingObj);
        },
        error: (error) => {
          console.error('Error creating booking:', error);
        }

      })


    } else {
      console.log("Failed to book")
    }
  }

  onDateRangeSelected(event: { startDate: Date; endDate: Date; startTime: string; endTime: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.startTime = event.startTime;
    this.endTime = event.endTime;
    console.log(this.isValidBooking())
  }

  isValidBooking(): boolean {
    // Check if dates are provided
    if (!this.startDate || !this.endDate) {
      return false;
    }

    // Create Date objects
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const now = new Date();

    // Reset time part of current date for date-only comparisons
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Convert times to comparable format (assuming they're in HH:mm format)
    const pick = this.convertTimeToMinutes(this.startTime);
    const drop = this.convertTimeToMinutes(this.endTime);

    // Basic date validation
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return false;
    }

    // Reset time part of dates for date-only comparisons
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    // Check if booking is in the past
    if (startDate < today) {
      return false;
    }

    // If same day booking
    if (startDate.getTime() === endDate.getTime()) {
      // Check if current time is less than pickup time for today's booking
      if (startDate.getTime() === today.getTime()) {
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        if (currentMinutes >= pick) {
          return false;
        }
      }
      // Validate pickup and drop time
      return pick < drop;
    }

    // If different days
    if (startDate < endDate) {
      // For future dates, no need to check times
      return true;
    }

    return false;
  }

  // Helper function to convert time string to minutes
  private convertTimeToMinutes(time: string): number {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  get totalPrice() {
    const start = this.startDate.getFullYear() + this.startDate.getMonth() + this.startDate.getDate();
    const end = this.endDate.getFullYear() + this.endDate.getMonth() + this.endDate.getDate();
    return end - start;
  }

  onPickupChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const index = selectElement.selectedIndex;
    this.selectPickupLocation(index);
  }

  onDropChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const index = selectElement.selectedIndex;
    this.selectDropLocation(index);
  }

  toggleLocationDrop() {
    this.showLocationPopup = true;
  }

  selectPickupLocation(index: number) {
    switch (index) {
      case 0: this.pickuplocation = Location.Kyiv; break;
      case 1: this.pickuplocation = Location.Lviv; break;
      case 2: this.pickuplocation = Location.Odesa; break;
      case 3: this.pickuplocation = Location.Kharkiv; break;
      case 4: this.pickuplocation = Location.Dnipro; break;
    }
  }
  selectDropLocation(index: number) {
    switch (index) {
      case 0: this.droplocation = Location.Kyiv; break;
      case 1: this.droplocation = Location.Lviv; break;
      case 2: this.droplocation = Location.Odesa; break;
      case 3: this.droplocation = Location.Kharkiv; break;
      case 4: this.droplocation = Location.Dnipro; break;
    }
  }
}
