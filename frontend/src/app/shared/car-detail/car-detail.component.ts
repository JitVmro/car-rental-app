import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, effect, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'
import { CarFeature } from '../../models/car.model';
import { Car } from '../../models/car.model';
import { Feedback } from '../../models/feedback';
import { CarDetailsService } from '../../core/services/car-details/car-details.service';
import { DatePickerComponent } from "../date-picker/date-picker.component";
import { AuthService } from '../../core/services/auth/auth-service.service';

@Component({
  selector: 'app-car-detail',
  standalone: true,
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css'],
  imports: [NgFor, DatePipe, FormsModule, NgIf, DatePickerComponent]
})
export class CarDetailComponent implements OnInit {

  feedbacks: Feedback[] = [];

  selectedImageIndex: number = 0;
  startDate: Date = new Date();
  endDate: Date = new Date();
  pricePerDay: number = 0;
  sortOrder: string = 'newest';
  carImages!: string[];
  carImage!: string;
  carFeatures: CarFeature[] = []
  currentPage: number = 1;
  itemsPerPage: number = 3;

  currentPaginatedFeedBackArray: Feedback[] = this.feedbacks.slice(0, 0 + this.itemsPerPage);

  selectedCar: Car | null = null
  startTime!: string;
  endTime!: string;

  constructor(
    private router: Router,
    private carDetailsService: CarDetailsService,
    private authService: AuthService,
  ) {
    effect(() => {
      const car = this.carDetailsService.selectedCar();
      if (car) {
        this.selectedCar = car;
        this.setCarFeaturesAndImages();
        this.calculatePrice();
        console.log(car.carId)
        carDetailsService.getCarReviews(car.carId).subscribe((reviews) => {
          this.feedbacks = reviews.content;
          console.log("FEEDBACKS : ", this.feedbacks);
        })
      }
    });
  }

  ngOnInit(): void {

  }

  setCarFeaturesAndImages(): void {
    if (this.selectedCar) {
      this.carFeatures = [
        { icon: "cardetail-icons/Vector.svg", value: this.selectedCar.gearBoxType },
        { icon: "cardetail-icons/Vector-1.svg", value: this.selectedCar.engineCapacity },
        { icon: "cardetail-icons/Vector-2.svg", value: this.selectedCar.fuelType },
        { icon: "cardetail-icons/Vector-3.svg", value: this.selectedCar.passengerCapacity },
        { icon: "cardetail-icons/Vector-4.svg", value: this.selectedCar.fuelConsumption + " L/100km" },
        { icon: "cardetail-icons/Vector-5.svg", value: this.selectedCar.climateControlOption },
      ];
      // this.carImages = this.selectedCar.images;
      this.carImage = this.selectedCar.images[0];
      this.carImages = this.selectedCar.images;
      this.selectedImageIndex = 0; // Reset image index when car changes
      this.pricePerDay = this.selectedCar.pricePerDay // Set initial price
    }
  }

  setMainImage(index: number): void {
    this.selectedImageIndex = index;
  }

  calculatePrice(): void {
    if (this.startDate && this.endDate && this.selectedCar) {
      this.pricePerDay = this.selectedCar.pricePerDay;
    } else if (this.selectedCar) {
      this.pricePerDay = this.selectedCar.pricePerDay;
    }
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

  bookCar(): void {
    if (this.isValidBooking()) {
      // Implement booking logic
      if (this.selectedCar) {
        console.log('Booking car:', {
          carId: this.selectedCar.carId,
          startDate: this.startDate,
          endDate: this.endDate,
          startTime: this.startTime,
          endTime: this.endTime,
          pricePerDay: this.pricePerDay
        });
      }
    }
  }

  sortFeedback(): void {
    this.feedbacks.sort((a, b) => {
      console.log(b.date, a.date)
      const aDate = new Date(a.date);
      const bDate = new Date(b.date);
      switch (this.sortOrder) {
        case 'newest':
          return bDate.getTime() - aDate.getTime();
        case 'oldest':
          return aDate.getTime() - bDate.getTime();
        case 'hRating':
          return b.rentalExperience - a.rentalExperience;
        case 'lRating':
          return a.rentalExperience - b.rentalExperience;
        default:
          return 0;
      }
    });
  }

  goToConfirmationPage() {
    if (this.authService.isLoggedIn()) {
      if (this.selectedCar)
        this.router.navigate(['/cars/booking', { carId: this.selectedCar.carId }])
    }
    else {
      document.getElementById('loginAlert')?.classList.remove('hidden')
      document.getElementById('loginAlert')?.classList.add('flex')
    }
  }

  getStarWidth(position: number, rating: number): string {
    if (position <= Math.floor(rating)) {
      return '100%';
    }
    if (position > Math.ceil(rating)) {
      return '0%';
    }
    return `${(rating % 1) * 100}%`;
  }

  //  FEEDBACK PAGINATION
  //  Computed property to get paginated feedbacks
  get paginatedFeedbacks(): Feedback[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.feedbacks?.slice(startIndex, startIndex + this.itemsPerPage);

  }

  //  Computed property to get total pages
  get totalPages(): number {
    return Math.ceil(this.feedbacks?.length / this.itemsPerPage);
  }

  //  Methods to handle Fedback pagination
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  closeDetails(): void {
    this.carDetailsService.clearSelectedCar();
    this.selectedCar = null;
  }

  getName(feedBackUserName: string) {
    return (feedBackUserName.charAt(0)?.toUpperCase() ?? '')
  }

  onDateRangeSelected(event: { startDate: Date; endDate: Date; startTime: string; endTime: string }) {
    this.startDate = event.startDate;
    this.endDate = event.endDate;
    this.startTime = event.startTime;
    this.endTime = event.endTime;
  }

  toggleDatePicker() {
    document.getElementById('d1')?.classList.toggle('hidden');
  }

  onCancel() {
    document.getElementById('loginAlert')?.classList.add('hidden')
    document.getElementById('loginAlert')?.classList.remove('flex');
  }

  onLogin() {
    document.getElementById('loginAlert')?.classList.remove('hidden');
    document.getElementById('loginAlert')?.classList.add('flex');
    this.router.navigate(["/login"]);
  }

}