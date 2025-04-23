import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-bookings-section',
  imports: [CommonModule],
  templateUrl: './bookings-section.component.html',
  styleUrl: './bookings-section.component.css'
})
export class BookingsSectionComponent {
  active: number = 0;

  setActive(index: number) {
    this.active = index;
  }

  isActive(index: number) {
    return this.active === index;
  }
}
