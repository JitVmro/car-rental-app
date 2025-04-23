import { Component, Input } from '@angular/core';
import { Car } from '../../models/car.model';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {

  }

  navigateToBookingConfirmation() {
    this.router.navigate(['cars/booking', { id: 47 }])
  }

  openCarPopup() {
    const popup = document.getElementById("carDetailPopup");
    popup?.classList.remove("hidden");
  }

  @Input() car!: Car;
}
