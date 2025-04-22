import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Review } from '../../models/review.model';
import { ReviewService } from '../../core/services/review.service';

@Component({
  selector: 'app-review-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-slider.component.html',
  styleUrls: ['./review-slider.component.css']
})
export class ReviewSliderComponent implements OnInit, AfterViewInit {
  reviews: Review[] = [];
  currentIndex = 0;
  visibleReviews: Review[] = [];
  reviewsPerPage = 3; // Default to 3 reviews per page
  animating = false;
  slideDirection = 'right'; // 'left' or 'right'
  isBrowser: boolean;
  
  @ViewChild('sliderContainer') sliderContainer!: ElementRef;

  constructor(
    private reviewService: ReviewService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.reviews = this.reviewService.getReviews();
    this.updateVisibleReviews();
  }

  ngAfterViewInit(): void {
    // Only run browser-specific code if we're in the browser
    if (this.isBrowser) {
      this.adjustReviewsPerPage();
      window.addEventListener('resize', () => this.adjustReviewsPerPage());
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
    this.visibleReviews = [];
    for (let i = 0; i < this.reviewsPerPage; i++) {
      const index = (this.currentIndex + i) % this.reviews.length;
      this.visibleReviews.push(this.reviews[index]);
    }
  }

  prevSlide(): void {
    if (this.animating) return;
    
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
    if (this.animating) return;
    
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
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  // Check if we have enough reviews to enable navigation
  hasMultiplePages(): boolean {
    return this.reviews.length > this.reviewsPerPage;
  }
}