import { Injectable } from '@angular/core';
import { Review } from '../../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviews: Review[] = [
    {
      id: 1,
      carName: 'Mercedes-Benz A class',
      carYear: 2019,
      imageUrl: 'assets/images/mercedes-benz-A-class.jpg',
      orderHistory: '#2437',
      orderDate: '(06.11.24)',
      rating: 4,
      reviewText: 'Fantastic service from start to finish! The booking process was smooth, and the staff was incredibly helpful in answering all my questions.',
      customerName: 'Sarah L.',
      customerLocation: 'New York, USA',
      reviewDate: '05.10.2024'
    },
    {
      id: 2,
      carName: 'Porsche 911',
      carYear: 2021,
      imageUrl: 'assets/images/porsche-911-2021.jpg',
      orderHistory: '#2437',
      orderDate: '(06.11.24)',
      rating: 4,
      reviewText: 'Fantastic service from start to finish!',
      customerName: 'Sarah L.',
      customerLocation: 'New York, USA',
      reviewDate: '05.10.2024'
    },
    {
      id: 3,
      carName: 'Nissan Z',
      carYear: 2024,
      imageUrl: 'assets/images/Nissan-Z-2021.jpg',
      orderHistory: '#2437',
      orderDate: '(06.11.24)',
      rating: 4,
      reviewText: 'Fantastic service from start to finish!',
      customerName: 'Sarah L.',
      customerLocation: 'New York, USA',
      reviewDate: '05.10.2024'
    },
    {
      id: 4,
      carName: 'BMW M3',
      carYear: 2023,
      imageUrl: 'assets/images/BMW-M3-2023.jpg',
      orderHistory: '#2438',
      orderDate: '(07.11.24)',
      rating: 5,
      reviewText: 'Amazing experience with this rental! The car was in perfect condition.',
      customerName: 'Michael T.',
      customerLocation: 'Los Angeles, USA',
      reviewDate: '06.10.2024'
    },
    {
      id: 5,
      carName: 'Audi RS7',
      carYear: 2022,
      imageUrl: 'assets/images/Audi-rs7-2022.jpg',
      orderHistory: '#2439',
      orderDate: '(08.11.24)',
      rating: 5,
      reviewText: 'Top-notch service and an incredible car. Will definitely rent again!',
      customerName: 'Jessica K.',
      customerLocation: 'Chicago, USA',
      reviewDate: '07.10.2024'
    }
  ];

  getReviews(): Review[] {
    return this.reviews;
  }
}