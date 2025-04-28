import { Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Car } from '../../models/car.model';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { User } from '../../models/User';
import { BookingServiceService } from '../../core/services/booking-service/booking-service.service';
import { Booking, BookingState,Location } from '../../models/booking.model';
import { DatePickerComponent } from "../../shared/date-picker/date-picker.component";
import { CarFilterService } from '../../core/services/car-filter.service';

@Component({
  selector: 'app-booking-page',
  templateUrl: './booking-page.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePickerComponent]
})
export class BookingPageComponent implements OnInit {

  selectedCar: Car | null = null
  currentUser: User | null;

  startDate: Date = new Date();
  endDate: Date = new Date();
  startTime: string = new Date().getHours() + ":" + new Date().getMinutes();
  endTime: string = new Date().getHours() + ":" + new Date().getMinutes();

  datePickerDisplayStatus: boolean = false;
  currentCarID: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private carFilterService: CarFilterService,
    private authService: AuthService,
    private bookingService: BookingServiceService
  ) {
    this.currentUser = this.authService.currentUserValue
  }

  ngOnInit(): void {
    this.currentCarID = this.route.snapshot.paramMap.get('carId');
    if (this.currentCarID) {
      const allCars = this.carFilterService.getAllCars();
      const currentCar = allCars.find(c => this.currentCarID === c.carId)
      if (currentCar) {
        this.selectedCar = currentCar;
      }
    }
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

    if (user && this.selectedCar) {
      const bookingObj: Booking = {
        id: this.bookingService.generateBookingId(),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        carimg: this.selectedCar?.imageUrl,
        carname: this.selectedCar.brand + this.selectedCar.model,
        state: BookingState.Reserved,
        startDate: this.startDate,
        endDate: this.endDate,
        startTime: this.startTime,
        endTime: this.endTime,
        pickuplocation: Location.Kyiv,
        droplocation: Location.Kyiv
      }
      this.bookingService.createBooking(bookingObj)
      this.router.navigate(['/bookings/new', { bId: bookingObj.id }])
      console.log(bookingObj);

    } else {
      console.log("Failed to book")
    }
  }

  onDateRangeSelected(event: { startDate: Date; endDate: Date; startTime: string; endTime: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.startTime = event.startTime;
    this.endTime = event.endTime;
  }

  isValidBooking(): boolean {
    if (!this.startDate || !this.endDate) return false;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const pick = this.startTime
    const drop = this.endTime
    console.log(pick, drop)
    if (drop > pick) {
      if (start <= end && start.getDate() >= new Date().getDate() && start.getMonth() === new Date().getMonth()) {
        return true;
      }
      else if (start <= end && start.getMonth() > new Date().getMonth()) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }

  }

  get totalPrice() {
    const start = this.startDate.getFullYear() + this.startDate.getMonth() + this.startDate.getDate();
    const end = this.endDate.getFullYear() + this.endDate.getMonth() + this.endDate.getDate();
    return end - start;
  }
}
