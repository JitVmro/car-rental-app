import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

interface Stat {
  title: string;
  value: string;
  description: string;
}

interface AboutUsResponse {
  stats: Stat[];
  imageUrl?: string;
}

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent implements OnInit {
  stats: Stat[] = [];
  imageUrl: string = '/assets/images/car-rental-rafiki.png'; // Default image
  loading: boolean = true;
  error: string | null = null;
  
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.fetchAboutUsData();
  }
  
  fetchAboutUsData(): void {
    const apiUrl = 'https://trpcstt2r6.execute-api.eu-west-2.amazonaws.com/dev/home/about-us';
    
    this.http.get<AboutUsResponse>(apiUrl)
      .pipe(
        catchError(error => {
          this.error = 'Failed to load about us data. Please try again later.';
          this.loading = false;
          console.error('Error fetching about us data:', error);
          return of({ stats: [] } as AboutUsResponse);
        })
      )
      .subscribe(response => {
        if (response.stats && response.stats.length > 0) {
          this.stats = response.stats;
        } else {
          // Fallback data if API returns empty stats
          this.stats = [
            {
              title: 'years',
              value: '15',
              description: 'in car rentals highlights a steadfast commitment to excellence, marked by a track record of trust and satisfaction among thousands of clients worldwide'
            },
            {
              title: 'locations',
              value: '6',
              description: 'we make car rentals accessible and convenient for customers no matter where their travels take them, ensuring quality service and easy access'
            },
            {
              title: 'car brands',
              value: '25',
              description: 'we cater to every kind of traveler, from business professionals to families and adventure seekers, ensuring the perfect vehicle is always available'
            },
            {
              title: 'cars',
              value: '100+',
              description: 'we cater to every kind of traveler, from business professionals to families and adventure seekers, ensuring the perfect vehicle is always available'
            }
          ];
        }
        
        // Update image URL if provided by API
        if (response.imageUrl) {
          this.imageUrl = response.imageUrl;
        }
        
        this.loading = false;
      });
  }
}