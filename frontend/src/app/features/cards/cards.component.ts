import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CardComponent } from '../../shared/card/card.component';
import { Car } from '../../models/car.model';
import { CarFilterService } from '../../core/services/car-filter.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css'],
  standalone: true,
  imports: [CommonModule, CardComponent]
})
export class CardsComponent implements OnInit, OnDestroy {
  // All cars in the system
  allCars: Car[] = [];

  // Featured cars for home page (first 4)
  featuredCars: Car[] = [];

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 16;
  totalPages: number = 1;
  displayedCars: Car[] = [];
  paginationArray: Array<number | string> = [];
  
  // View state
  showAllCars: boolean = false;
  
  // Subscription to filtered cars
  private subscription: Subscription = new Subscription();

  constructor(private carFilterService: CarFilterService) {}

  ngOnInit(): void {
    // Subscribe to filtered cars from the service
    this.subscription = this.carFilterService.filteredCars$.subscribe(filteredCars => {
      this.allCars = filteredCars;
      // Update featured cars when filters change (first 4)
      this.featuredCars = this.allCars.slice(0, 4);
      
      if (this.showAllCars) {
        this.calculateTotalPages();
        this.currentPage = 1;
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

  // Calculate total pages based on cars array length and items per page
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.allCars.length / this.itemsPerPage);
    console.log(`Total pages: ${this.totalPages}`);
  }

  // Update displayed cars based on current page
  updateDisplayedCars(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.allCars.length);
    this.displayedCars = this.allCars.slice(startIndex, endIndex);
    console.log(`Displaying cars ${startIndex + 1} to ${endIndex} (${this.displayedCars.length} cars)`);
  }

  // Update the pagination array with numbers and ellipsis
  updatePaginationArray(): void {
    this.paginationArray = [];
    
    if (this.totalPages <= 5) {
      // If 5 or fewer pages, show all page numbers
      for (let i = 1; i <= this.totalPages; i++) {
        this.paginationArray.push(i);
      }
    } else {
      // Always show first page
      this.paginationArray.push(1);
      
      if (this.currentPage > 3) {
        this.paginationArray.push('...');
      }
      
      // Show current page and neighbors
      for (let i = Math.max(2, this.currentPage - 1); i <= Math.min(this.totalPages - 1, this.currentPage + 1); i++) {
        this.paginationArray.push(i);
      }
      
      if (this.currentPage < this.totalPages - 2) {
        this.paginationArray.push('...');
      }
      
      // Always show last page
      if (this.totalPages > 1) {
        this.paginationArray.push(this.totalPages);
      }
    }
  }

  // Handle page number click
  handlePageClick(item: number | string): void {
    if (typeof item === 'number') {
      this.goToPage(item);
    }
  }

  // Go to specific page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedCars();
      this.updatePaginationArray();
    }
  }

  // Check if the page item is a number (not ellipsis)
  isNumber(item: number | string): boolean {
    return typeof item === 'number';
  }

  // Go to previous page
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedCars();
      this.updatePaginationArray();
    }
  }

  // Next page
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedCars();
      this.updatePaginationArray();
    }
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