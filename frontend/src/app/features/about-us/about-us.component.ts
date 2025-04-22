import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css']
})
export class AboutUsComponent {
  // Stats data could be moved to a service if needed
  stats = [
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