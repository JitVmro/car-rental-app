import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environment/environment';

interface Stat {
  title: string;
  numericValue: string;
  description: string;
}

interface AboutUsResponse {
  content: Stat[];
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
    const apiUrl = `${environment.apiUrl}/home/about-us`;
    
    this.http.get<AboutUsResponse>(apiUrl)
      .pipe(
        catchError(error => {
          this.error = 'Failed to load about us data. Please try again later.';
          this.loading = false;
          console.error('Error fetching about us data:', error);
          return of({ content: [] } as AboutUsResponse);
        })
      )
      .subscribe(response => {
        if (response.content && response.content.length > 0) {
          this.stats = response.content;
        } else {
          // Set error message if API returns empty content
          this.error = 'No about us data available from the server.';
          console.error("No content received from API");
        }
        
        // Update image URL if provided by API
        if (response.imageUrl) {
          this.imageUrl = response.imageUrl;
        }
        
        this.loading = false;
      });
  }
}