import { Component } from '@angular/core';
import { BookingsSectionComponent } from "../bookings-section/bookings-section.component";

@Component({
  selector: 'app-bookings',
  imports: [BookingsSectionComponent],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css'
})
export class BookingsComponent {

}
