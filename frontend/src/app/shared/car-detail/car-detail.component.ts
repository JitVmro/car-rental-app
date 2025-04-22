import { DatePipe, NgFor } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'
import { Car, CarFeature, ClimateControlOption, FuelType, GearBoxType, Status } from '../../models/car';
import { Feedback } from '../../models/feedback';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.css'],
  imports: [NgFor, DatePipe, FormsModule]
})

export class CarDetailComponent implements OnInit {

  carDetails: Car = {
    carId: '87578587',
    carRating: '4.8',
    climateControlOption: ClimateControlOption.CLIMATE_CONTROL,
    engineCapacity: '3.0 turbo (340 h.p.)',
    fuelConsumption: '10.0l/100 km.',
    fuelType: FuelType.PETROL,
    gearBoxType: GearBoxType.AUTOMATIC,
    images: [
      'car-images/car 1/Rectangle 39.svg',
      'car-images/car 1/Rectangle 40.svg',
      'car-images/car 1/Rectangle 41.svg',
      'car-images/car 1/Rectangle 42.svg',
      'car-images/car 1/Rectangle 43.svg',
    ],
    location: 'Ukraine, Kyiv',
    model: 'Audi A6 Quattro 2023',
    passengerCapacity: '5',
    pricePerDay: '20',
    serviceRating: '',
    status: Status.AVAILABLE
  };

  feedbacks: Feedback[] = [
    {
      userName: 'Sarah L.',
      userImage: 'assets/user1.jpg',
      date: new Date('2024-01-12'),
      rating: 5,
      comment: 'Fantastic service from start to finish! The booking process was smooth, and the staff was incredibly helpful in answering all my questions.'
    },
    {
      userName: 'Sarah L.',
      userImage: 'assets/user1.jpg',
      date: new Date('2024-01-11'),
      rating: 5,
      comment: 'Fantastic service from start to finish! The booking process was smooth, and the staff was incredibly helpful in answering all my questions.'
    },
    {
      userName: 'Thiruvananthapuram L.',
      userImage: 'assets/user1.jpg',
      date: new Date('2024-01-11'),
      rating: 4.5,
      comment: 'Fantastic service from start to finish! The booking process was smooth, and the staff was incredibly helpful in answering all my questions.'
    },
    {
      userName: 'Sarah L.',
      userImage: 'assets/user1.jpg',
      date: new Date('2024-01-07'),
      rating: 5,
      comment: 'Fantastic service from start to finish! The booking process was smooth, and the staff was incredibly helpful in answering all my questions.'
    },
    {
      userName: 'Thiruvananthapuram L.',
      userImage: 'assets/user1.jpg',
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
  carImages: string[];
  carFeatures: CarFeature[] = []
  currentPage: number = 1;
  itemsPerPage: number = 3;

  currentPaginatedFeedBackArray: Feedback[] = this.feedbacks.slice(0, 0 + this.itemsPerPage);

  constructor(
    private router: Router
  ) {
    this.carImages = this.carDetails.images;
  }

  ngOnInit(): void {
    this.getCarFeatures();
  }

  getCarFeatures(): void {
    this.carFeatures = [
      { icon: "cardetail-icons/Vector.svg", value: this.carDetails.gearBoxType },
      { icon: "cardetail-icons/Vector-1.svg", value: this.carDetails.engineCapacity },
      { icon: "cardetail-icons/Vector-2.svg", value: this.carDetails.fuelType },
      { icon: "cardetail-icons/Vector-3.svg", value: this.carDetails.passengerCapacity },
      { icon: "cardetail-icons/Vector-4.svg", value: this.carDetails.fuelConsumption },
      { icon: "cardetail-icons/Vector-5.svg", value: this.carDetails.climateControlOption },
    ]
  }

  setMainImage(index: number): void {
    this.selectedImageIndex = index;
  }

  calculatePrice(): void {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      this.totalPrice = parseFloat(this.carDetails.pricePerDay);
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
      console.log('Booking car:', {
        carId: this.carDetails.carId,
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

  carDetailPopupRemove(): void {
    document.getElementById("carDetailPopup")?.classList.add('hidden')
  }

  goToConfirmationPage() {
    this.router.navigateByUrl(`/all-cars/booking/${this.carDetails.carId}`)
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

  // Computed property to get paginated feedbacks
  get paginatedFeedbacks(): Feedback[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.feedbacks.slice(startIndex, startIndex + this.itemsPerPage);

  }

  // Computed property to get total pages
  get totalPages(): number {
    return Math.ceil(this.feedbacks.length / this.itemsPerPage);
  }

  // Methods to handle pagination
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
}