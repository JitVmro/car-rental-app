import { Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarDetailsService } from '../../core/services/car-details/car-details.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Car } from '../../models/car.model';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { User } from '../../models/User';
import { BookingServiceService } from '../../core/services/booking-service/booking-service.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { Booking, Location } from '../../models/booking.model';
import { DatePickerComponent } from "../../shared/date-picker/date-picker.component";

@Component({
  standalone: true,
  selector: 'app-car-booking-edit',
  imports: [CommonModule, FormsModule],
  templateUrl: './car-booking-edit.component.html',
  styleUrl: './car-booking-edit.component.css'
})
export class CarBookingEditComponent implements OnInit {
  selectedCar: Car | null = null
  currentUser: User | null;
  daysCaluclated: number = 0;
  currentBookingID!: string | null;
  currentBookingInfo!: Booking;
  showLocationPopup: boolean = false;

  startTime!: string;
  endTime!: string;
  startDate!: Date;
  endDate!: Date;
  Location!: Location;
  pickuplocation!: Location;
  droplocation!: Location;

  datePickerDisplayStatus: boolean = false;

  private subscription!: Subscription;

  constructor(
    private router: Router,
    private carService: CarDetailsService,
    private authService: AuthService,
    private bookingService: BookingServiceService,
    private route: ActivatedRoute
  ) {
    this.currentUser = this.authService.currentUserValue;
    effect(() => {
      const car = this.carService.selectedCar();
      console.log(car);
      if (car) {
        this.selectedCar = car;
      }
      console.log("SLECTED CAR: ", this.selectedCar)
    })
  }

  ngOnInit(): void {
    this.currentBookingID = this.route.snapshot.paramMap.get('bId');

    if (this.currentBookingID) {
      this.subscription = this.bookingService
        .getBooking(parseInt(this.currentBookingID))
        .subscribe({
          next: (value) => {
            this.currentBookingInfo = value;
            console.log("Booking info:", this.currentBookingInfo);
          },
          error: (error) => {
            console.error('Error fetching booking:', error);
          }
        });
    }

    this.setSelectedCar()
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  setSelectedCar() {
    const car = this.carService.selectedCar();
    if (car) {
      this.selectedCar = car;
    }
  }

  changeLocation() {
    // Implement location change logic
  }

  changeDates() {
    // Implement dates change logic
  }

  isValidSave(): boolean {
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

  onDateRangeSelected(event: { startDate: Date; endDate: Date; startTime: string; endTime: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.startTime = event.startTime;
    this.endTime = event.endTime;
    console.log(this.isValidSave())
  }

  toggleDatePicker() {
    this.datePickerDisplayStatus = !this.datePickerDisplayStatus;
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

  toggleLocationDrop(){
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


  updateBooking() {
    this.currentBookingInfo.startDate = this.startDate;
    this.currentBookingInfo.endDate = this.endDate;
    this.currentBookingInfo.startTime = this.startTime;
    this.currentBookingInfo.endTime = this.endTime;
    this.currentBookingInfo.pickuplocation = this.pickuplocation;
    this.currentBookingInfo.droplocation = this.droplocation;


    this.bookingService.saveBooking(this.currentBookingInfo);
    this.router.navigate(["/bookings"]);
  }




}
