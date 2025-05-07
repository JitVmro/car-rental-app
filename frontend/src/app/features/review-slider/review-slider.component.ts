import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, PLATFORM_ID, Inject, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Review } from '../../models/review.model';
import { ReviewService } from '../../core/services/review.service';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-review-slider',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './review-slider.component.html',
  styleUrls: ['./review-slider.component.css']
})
export class ReviewSliderComponent implements OnInit, AfterViewInit, OnDestroy {
  reviews: Review[] = [];
  currentIndex = 0;
  visibleReviews: Review[] = [];
  reviewsPerPage = 3; // Default to 3 reviews per page
  animating = false;
  slideDirection = 'right'; // 'left' or 'right'
  isBrowser: boolean;
  loading = true;
  error = false;
  private subscription: Subscription | null = null;
  
  @ViewChild('sliderContainer') sliderContainer!: ElementRef;

  constructor(
    private reviewService: ReviewService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.loadReviews();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadReviews(): void {
    this.loading = true;
    this.error = false;
    
    // Debug: Log before API call
    console.log('Fetching reviews...');
    
    this.subscription = this.reviewService.getReviews().subscribe({
      next: (reviews) => {
        console.log('Reviews received:', reviews);
        this.reviews = reviews;
        this.loading = false;
        
        if (reviews.length > 0) {
          console.log('First review:', reviews[0]);
          this.updateVisibleReviews();
        } else {
          console.warn('No reviews returned from API');
        }
      },
      error: (err) => {
        console.error('Failed to load reviews:', err);
        this.error = true;
        this.loading = false;
      },
      complete: () => {
        console.log('Review fetch complete');
      }
    });
  }

  ngAfterViewInit(): void {
    // Only run browser-specific code if we're in the browser
    if (this.isBrowser) {
      this.adjustReviewsPerPage();
      window.addEventListener('resize', () => this.adjustReviewsPerPage());
    }
  }

  // Handle image loading errors
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = 'assets/images/car-placeholder.jpg';
    }
  }

  adjustReviewsPerPage(): void {
    // Only run if we're in the browser
    if (!this.isBrowser) return;

    const width = window.innerWidth;
    if (width < 768) {
      this.reviewsPerPage = 1; // Mobile: 1 review
    } else if (width < 1024) {
      this.reviewsPerPage = 2; // Tablet: 2 reviews
    } else {
      this.reviewsPerPage = 3; // Desktop: 3 reviews
    }
    this.updateVisibleReviews();
  }

  updateVisibleReviews(): void {
    if (!this.reviews || this.reviews.length === 0) {
      console.warn('No reviews to display');
      this.visibleReviews = [];
      return;
    }
    
    console.log('Updating visible reviews. Total reviews:', this.reviews.length);
    this.visibleReviews = [];
    for (let i = 0; i < Math.min(this.reviewsPerPage, this.reviews.length); i++) {
      const index = (this.currentIndex + i) % this.reviews.length;
      this.visibleReviews.push(this.reviews[index]);
    }
    console.log('Visible reviews:', this.visibleReviews);
  }

  prevSlide(): void {
    if (this.animating || this.reviews.length <= this.reviewsPerPage) return;
    
    this.animating = true;
    this.slideDirection = 'left';
    
    setTimeout(() => {
      // Move back by the number of reviews per page
      this.currentIndex = (this.currentIndex - this.reviewsPerPage + this.reviews.length) % this.reviews.length;
      this.updateVisibleReviews();
      this.animating = false;
    }, 300);
  }

  nextSlide(): void {
    if (this.animating || this.reviews.length <= this.reviewsPerPage) return;
    
    this.animating = true;
    this.slideDirection = 'right';
    
    setTimeout(() => {
      // Move forward by the number of reviews per page
      this.currentIndex = (this.currentIndex + this.reviewsPerPage) % this.reviews.length;
      this.updateVisibleReviews();
      this.animating = false;
    }, 300);
  }

  // Generate an array of stars for the rating
  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.round(rating) ? 1 : 0);
  }

  // Check if we have enough reviews to enable navigation
  hasMultiplePages(): boolean {
    return this.reviews.length > this.reviewsPerPage;
  }
}