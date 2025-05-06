import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FAQ, FaqApiResponse } from '../../models/faq.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private apiUrl = `${environment.apiUrl}/home/faq`;

  private faqs: FAQ[] = [];
  private faqsSubject = new BehaviorSubject<FAQ[]>([]);
  private isLoadingSubject = new BehaviorSubject<boolean>(true);
  private errorSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  getFaqs(): Observable<FAQ[]> {
    // If we haven't loaded FAQs yet, fetch them
    if (this.faqs.length === 0) {
      this.fetchFaqs();
    }
    return this.faqsSubject.asObservable();
  }

  getIsLoading(): Observable<boolean> {
    return this.isLoadingSubject.asObservable();
  }

  getError(): Observable<string | null> {
    return this.errorSubject.asObservable();
  }

  fetchFaqs(): void {
    this.isLoadingSubject.next(true);
    this.errorSubject.next(null);

    this.http.get<FaqApiResponse>(this.apiUrl)
      .pipe(
        map(response => {
          // Transform API response to our FAQ model with isOpen property
          if (response && response.faqs && response.faqs.length > 0) {
            return response.faqs.map((faq, index) => ({
              ...faq,
              isOpen: index === 0 // Open the first FAQ by default
            }));
          } else {
            // If API returns empty data, set error and return empty array
            this.errorSubject.next('No FAQ data available from the server.');
            return [];
          }
        }),
        catchError(error => {
          console.error('Error fetching FAQs:', error);
          this.errorSubject.next('Failed to load FAQs. Please try again later.');
          this.isLoadingSubject.next(false);
          throw error;
        })
      )
      .subscribe(
        {
          next: (faqs) => {
            this.faqs = faqs;
            this.faqsSubject.next(this.faqs);
            this.isLoadingSubject.next(false);
          },
          error: () => {
            this.faqsSubject.next([]);
            this.isLoadingSubject.next(false);
          }
        }
      );
  }

  toggleFaq(index: number): void {
    if (index >= 0 && index < this.faqs.length) {
      this.faqs = this.faqs.map((faq, i) => {
        if (i === index) {
          return { ...faq, isOpen: !faq.isOpen };
        }
        return faq;
      });
      this.faqsSubject.next(this.faqs);
    }
  }

  // Method to refresh FAQs from API
  refreshFaqs(): void {
    this.fetchFaqs();
  }
}