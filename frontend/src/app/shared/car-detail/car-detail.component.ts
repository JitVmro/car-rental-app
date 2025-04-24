import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, effect, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'
import { CarFeature, ClimateControlOption, FuelType, GearBoxType, Status } from '../../models/car.model';
import { Car } from '../../models/car.model';
import { Feedback } from '../../models/feedback';
import { CalendarMonth, CalendarDate } from '../../models/calendar.model';
import { CarDetailsService } from '../../core/services/car-details/car-details.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-car-detail',
  standalone: true,
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css'],
  imports: [NgFor, DatePipe, FormsModule, NgIf]
})
export class CarDetailComponent implements OnInit {

  weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  currentDate = new Date();
  displayMonths: CalendarMonth[] = [];
  pickupTime: string = '07:00';
  dropoffTime: string = '10:30';

  feedbacks: Feedback[] = [
    {
      userName: 'Sarah L.',
      date: new Date('2024-01-12'),
      rating: 5,
      comment: 'Fantastic service from start to finish! The booking process was smooth, and the staff was incredibly helpful in answering all my questions.',
      userImage: ''
    },
    {
      userName: 'Sarah L.',
      date: new Date('2024-01-11'),
      rating: 5,
      comment: 'Fantastic service from start to finish! The booking process was smooth, and the staff was incredibly helpful in answering all my questions.'
    },
    {
      userName: 'Thiruvananthapuram L.',
      date: new Date('2024-01-11'),
      rating: 4.5,
      comment: 'Fantastic service from start to finish! The booking process was smooth, and the staff was incredibly helpful in answering all my questions.'
    },
    {
      userName: 'Sarah L.',
      date: new Date('2024-01-07'),
      rating: 5,
      comment: 'Fantastic service from start to finish! The booking process was smooth, and the staff was incredibly helpful in answering all my questions.'
    },
    {
      userName: 'Thiruvananthapuram L.',
      date: new Date('2024-01-13'),
      rating: 4.5,
      comment: 'Fantastic service from start to finish! The booking process was smooth, and the staff was incredibly helpful in answering all my questions.'
    },
    {
      userName: 'Sarah L.',
      userImage: 'assets/user1.jpg',
      date: new Date('2024-01-14'),
      rating: 5,
      comment: 'Fantastic service from start to finish! The booking process was smooth, and the staff was incredibly helpful in answering all my questions.'
    },
    {
      userName: 'Thiruvananthapuram L.',
      userImage: 'assets/user1.jpg',
      date: new Date('2024-01-10'),
      rating: 4.5,
      comment: 'Fantastic service from start to finish! The booking process was smooth, and the staff was incredibly helpful in answering all my questions.'
    },
    {
      userName: 'Thiruvananthapuram L.',
      userImage: 'assets/user1.jpg',
      date: new Date('2024-01-11'),
      rating: 4.5,
      comment: 'Fantastic service from start to finish! The booking process was smooth, and the staff was incredibly helpful in answering all my questions.'
    }
    // Add more feedback items
  ];

  selectedImageIndex: number = 0;
  startDate: string = '';
  endDate: string = '';
  totalPrice: number = 0;
  sortOrder: string = 'newest';
  carImages!: string[];
  carFeatures: CarFeature[] = []
  currentPage: number = 1;
  itemsPerPage: number = 3;

  currentPaginatedFeedBackArray: Feedback[] = this.feedbacks.slice(0, 0 + this.itemsPerPage);

  selectedCar: Car | null = null

  constructor(
    private router: Router,
    private carService: CarDetailsService,
  ) {

    effect(() => {
      const car = this.carService.selectedCar();
      if (car) {
        this.selectedCar = car;
        this.setCarFeaturesAndImages();
        this.calculatePrice();
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
      this.carImages = this.selectedCar.images;
      this.selectedImageIndex = 0; // Reset image index when car changes
      this.totalPrice = parseFloat(this.selectedCar.pricePerDay); // Set initial price
    }
  }

  setMainImage(index: number): void {
    this.selectedImageIndex = index;
  }

  calculatePrice(): void {
    if (this.startDate && this.endDate && this.selectedCar) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      this.totalPrice = days * parseFloat(this.selectedCar.pricePerDay);
    } else if (this.selectedCar) {
      this.totalPrice = parseFloat(this.selectedCar.pricePerDay);
    }
  }

  isValidBooking(): boolean {
    if (!this.startDate || !this.endDate) return false;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return start < end && start >= new Date();
  }

  bookCar(): void {
    if (this.isValidBooking()) {
      // Implement booking logic
      if (this.selectedCar)
        console.log('Booking car:', {
          carId: this.selectedCar.carId,
          startDate: this.startDate,
          endDate: this.endDate,
          totalPrice: this.totalPrice
        });
    }
  }

  sortFeedback(): void {
    this.feedbacks.sort((a, b) => {
      switch (this.sortOrder) {
        case 'newest':
          return b.date.getTime() - a.date.getTime();
        case 'oldest':
          return a.date.getTime() - b.date.getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
  }

  goToConfirmationPage() {
    if (this.selectedCar)
      this.router.navigateByUrl(`/all-cars/booking/${this.selectedCar.carId}`)
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
    return this.feedbacks.slice(startIndex, startIndex + this.itemsPerPage);

  }

  //  Computed property to get total pages
  get totalPages(): number {
    return Math.ceil(this.feedbacks.length / this.itemsPerPage);
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
    this.carService.clearSelectedCar();
    this.selectedCar = null;
  }

  getName(feedBackUserName: string) {
    return (feedBackUserName.charAt(0)?.toUpperCase() ?? '')
  }
}