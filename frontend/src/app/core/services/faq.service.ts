import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FAQ, FaqApiResponse } from '../../models/faq.model';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private apiUrl = 'https://trpcstt2r6.execute-api.eu-west-2.amazonaws.com/dev/home/faq';
  
  // Default FAQs as fallback
  private defaultFaqs: FAQ[] = [
    {
      question: 'What documents do I need to rent a car?',
      answer: 'To rent a car, you will need a valid driver\'s license, a credit card in your name, and a government-issued photo ID (such as a passport or national ID). International renters may also need to present an International Driving Permit (IDP) in addition to their home country driver\'s license.',
      isOpen: true
    },
    {
      question: 'Is there an age requirement to rent a car?',
      answer: 'Yes, most rental companies require drivers to be at least 21 years old. However, drivers under 25 may be subject to a "young driver" surcharge. Some specialty vehicles may have higher age requirements. Always check the specific requirements when booking.',
      isOpen: false
    },
    {
      question: 'Can I add an additional driver to my rental?',
      answer: 'Yes, you can add additional drivers to your rental. Each additional driver will need to present their valid driver\'s license and meet the same age requirements as the primary renter. There may be an additional fee for each extra driver added to the rental agreement.',
      isOpen: false
    },
    {
      question: 'What should I do if the rental car breaks down or I get into an accident?',
      answer: 'If the rental car breaks down or you get into an accident, first ensure everyone\'s safety and call emergency services if needed. Then contact our 24/7 roadside assistance number provided in your rental agreement. Document the incident with photos and collect information from any other parties involved if it\'s an accident. Don\'t attempt to repair the vehicle yourself.',
      isOpen: false
    },
    {
      question: 'Is there a mileage limit on my rental?',
      answer: 'Most of our standard rentals come with unlimited mileage. However, some specialty vehicles or long-term rentals may have daily or weekly mileage limits. Any mileage restrictions will be clearly stated in your rental agreement before you sign. Exceeding the mileage limit will result in additional charges per mile/kilometer.',
      isOpen: false
    }
  ];

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
            // If API returns empty data, use default FAQs
            return this.defaultFaqs;
          }
        }),
        catchError(error => {
          console.error('Error fetching FAQs:', error);
          this.errorSubject.next('Failed to load FAQs. Using default questions instead.');
          return of(this.defaultFaqs);
        })
      )
      .subscribe(
        faqs => {
          this.faqs = faqs;
          this.faqsSubject.next(this.faqs);
          this.isLoadingSubject.next(false);
        }
      );
  }

  toggleFaq(index: number): void {
    this.faqs = this.faqs.map((faq, i) => {
      if (i === index) {
        return { ...faq, isOpen: !faq.isOpen };
      }
      return faq;
    });
    this.faqsSubject.next(this.faqs);
  }

  // Method to refresh FAQs from API (useful for testing)
  refreshFaqs(): void {
    this.fetchFaqs();
  }
}