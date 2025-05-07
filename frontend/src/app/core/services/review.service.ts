import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Review } from '../../models/review.model';
import { environment } from '../../../environment/environment';

interface FeedbackItem {
  feedbackId: string;
  feedbackText: string;
  rating: string;
  date: string;
  author: string;
  carModel: string;
  carImageUrl: string | null;
  orderHistory: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/feedbacks/recent`;

  constructor(private http: HttpClient) {}

  getReviews(): Observable<Review[]> {
    console.log("Fetching reviews from:", this.apiUrl);
    
    return this.http.get<any>(this.apiUrl)
      .pipe(
        tap(response => console.log("Raw API response:", response)),
        map(response => {
          // Handle different response formats
          let feedbackItems: FeedbackItem[] = [];
          
          if (Array.isArray(response)) {
            // Direct array response
            feedbackItems = response;
          } else if (response && response.body) {
            // Lambda API Gateway format with body
            try {
              // If body is a string, parse it
              const body = typeof response.body === 'string' 
                ? JSON.parse(response.body) 
                : response.body;
                
              if (Array.isArray(body)) {
                feedbackItems = body;
              }
            } catch (e) {
              console.error("Error parsing response body:", e);
            }
          } else if (response && typeof response === 'object') {
            // Try to find an array in the response
            for (const key in response) {
              if (Array.isArray(response[key])) {
                feedbackItems = response[key];
                break;
              }
            }
          }
          
          console.log("Extracted feedback items:", feedbackItems);
          return this.mapApiResponseToReviews(feedbackItems);
        }),
        tap(reviews => console.log("Mapped reviews:", reviews)),
        catchError(this.handleError)
      );
  }

  private mapApiResponseToReviews(items: FeedbackItem[]): Review[] {
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.warn("No feedback items to map");
      return [];
    }
    
    return items.map(item => {
      console.log("Processing feedback item:", item);
      
      // Extract order number and date from orderHistory
      let orderNumber = '';
      let orderDate = '';
      
      if (item.orderHistory) {
        const orderMatch = item.orderHistory.match(/#([^ ]+)\s+\((.+)\)/);
        if (orderMatch) {
          orderNumber = orderMatch[1];
          orderDate = `(${orderMatch[2]})`;
        } else {
          orderNumber = item.orderHistory.replace('#', '');
        }
      }
      
      // Extract customer name and location from author
      let customerName = 'Anonymous';
      let customerLocation = '';
      
      if (item.author && item.author !== 'Anonymous') {
        const authorParts = item.author.split(',');
        customerName = authorParts[0].trim();
        customerLocation = authorParts.length > 1 ? authorParts.slice(1).join(',').trim() : '';
      }
      
      // Extract car details
      let carName = 'Unknown';
      let carYear = 0;
      
      if (item.carModel && item.carModel !== 'Unknown Model') {
        const carParts = item.carModel.split(' ');
        // Check if the last part is a year
        if (carParts.length > 0) {
          const lastPart = carParts[carParts.length - 1];
          if (!isNaN(parseInt(lastPart)) && lastPart.length === 4) {
            carYear = parseInt(lastPart);
            carParts.pop(); // Remove year
            carName = carParts.join(' '); // Rest is car name
          } else {
            carName = item.carModel;
          }
        }
      }
      
      // Use default image if none provided
      const imageUrl = item.carImageUrl || 'assets/images/car-placeholder.jpg';
      
      const review: Review = {
        id: item.feedbackId || '',
        carName: carName || 'Unknown',
        carYear: carYear || 0,
        imageUrl: imageUrl,
        orderHistory: `#${orderNumber}`,
        orderDate: orderDate,
        rating: parseFloat(item.rating) || 0,
        reviewText: item.feedbackText || '',
        customerName: customerName,
        customerLocation: customerLocation || '',
        reviewDate: item.date || ''
      };
      
      console.log("Mapped review:", review);
      return review;
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('Error fetching reviews:', error);
    let errorMessage = 'Failed to load reviews';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}, Message: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
