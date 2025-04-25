import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CardComponent } from '../../shared/card/card.component';
import { Car } from '../../models/car.model';
import { CarFilterService } from '../../core/services/car-filter.service';
import { Subscription } from 'rxjs';
import { CarDetailsService } from '../../core/services/car-details/car-details.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css'],
  standalone: true,
  imports: [CommonModule, CardComponent]
})
export class CardsComponent implements OnInit, OnDestroy {
  // Reference to the cars container element
  @ViewChild('carsContainer') carsContainer!: ElementRef;
  
  // Input to determine if this is the home page or cars page
  @Input() isHomePage: boolean = true;
  @Output() loginPopup: EventEmitter<void> = new EventEmitter<void>();

  handleLoginPopup() {
    this.loginPopup.emit();
  }
  
  // All cars in the system
  allCars: Car[] = [];

  // Featured cars for home page (first 4)
  featuredCars: Car[] = [];

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 12; // Set to 12 cars per page
  totalPages: number = 1;
  displayedCars: Car[] = [];
  paginationArray: number[] = [];

  // View state
  showAllCars: boolean = false;

  // Subscription to filtered cars
  private subscription: Subscription = new Subscription();

  constructor(
    private carFilterService: CarFilterService,
    private carService: CarDetailsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Subscribe to filtered cars from the service
    this.subscription = this.carFilterService.filteredCars$.subscribe(filteredCars => {
      this.allCars = filteredCars;
      
      // Update featured cars (first 4)
      this.featuredCars = this.allCars.slice(0, 4);

      if (this.showAllCars || !this.isHomePage) {
        this.calculateTotalPages();
        this.updateDisplayedCars();
        this.updatePaginationArray();
      }
    });

    // Initialize pagination
    this.calculateTotalPages();
    this.updateDisplayedCars();
    this.updatePaginationArray();
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Selecting single car card for detail popup
  showCarDetails(car: Car) {
    this.carService.setSelectedCar(car);
  }

  // Calculate total pages based on cars array length and items per page
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.allCars.length / this.itemsPerPage);
  }

  // Update displayed cars based on current page
  updateDisplayedCars(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.allCars.length);
    this.displayedCars = this.allCars.slice(startIndex, endIndex);
  }

  // Update the pagination array based on the current page and total pages
  updatePaginationArray(): void {
    this.paginationArray = [];

    if (this.totalPages <= 4) {
      // If 4 or fewer pages, show all page numbers
      for (let i = 1; i <= this.totalPages; i++) {
        this.paginationArray.push(i);
      }
    } else {
      // For more than 4 pages, show a window of 4 pages
      let startPage = Math.max(1, Math.min(this.currentPage - 1, this.totalPages - 3));
      let endPage = Math.min(startPage + 3, this.totalPages);
      
      for (let i = startPage; i <= endPage; i++) {
        this.paginationArray.push(i);
      }
    }
  }

  // Check if we're on the first set of pages
  isFirstPageSet(): boolean {
    return this.paginationArray.length > 0 && this.paginationArray[0] === 1;
  }

  // Check if we're on the last set of pages
  isLastPageSet(): boolean {
    return this.paginationArray.length > 0 && 
           this.paginationArray[this.paginationArray.length - 1] === this.totalPages;
  }

  // Handle page number click
  goToPage(page: number, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedCars();
      this.updatePaginationArray();
      
      // Scroll to the cars container after a short delay to ensure DOM update
      setTimeout(() => {
        if (this.carsContainer) {
          this.carsContainer.nativeElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'
          });
        }
      }, 100);
    }
  }

  // Go to previous page set (when there are more than 4 pages total)
  prevPageSet(event: Event): void {
    event.preventDefault();
    if (this.currentPage > 1) {
      // Move back by 4 pages in the pagination window
      const targetPage = Math.max(1, this.paginationArray[0] - 4);
      this.goToPage(targetPage);
    }
  }

  // Next page set (when there are more than 4 pages total)
  nextPageSet(event: Event): void {
    event.preventDefault();
    if (this.currentPage < this.totalPages) {
      // Move forward by 4 pages in the pagination window
      const targetPage = Math.min(this.totalPages, this.paginationArray[this.paginationArray.length - 1] + 1);
      this.goToPage(targetPage);
    }
  }

  // Go to next page
  nextPage(event: Event): void {
    event.preventDefault();
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  // Navigate to all cars page
  viewAllCars(): void {
    this.router.navigate(['/cars']);
  }

  // Toggle between home view and all cars view
  toggleViewAllCars(): void {
    this.showAllCars = !this.showAllCars;

    if (this.showAllCars) {
      // When showing all cars, calculate pagination
      this.calculateTotalPages();
      this.currentPage = 1;
      this.updateDisplayedCars();
    }

    this.updatePaginationArray();
  }
}