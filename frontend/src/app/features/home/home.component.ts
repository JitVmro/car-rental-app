import { Component } from '@angular/core';

import { CarFilterComponent } from "../car-filter/car-filter.component";
import { CardsComponent } from "../cards/cards.component";
import { AboutUsComponent } from "../about-us/about-us.component";
import { ReviewSliderComponent } from "../review-slider/review-slider.component";
import { FaqComponent } from "../faq/faq.component";
import { CarDetailComponent } from "../../shared/car-detail/car-detail.component";
import { MapComponent } from "../map/map.component";
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-home',

  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  imports: [CarFilterComponent, CardsComponent, AboutUsComponent, ReviewSliderComponent, FaqComponent, MapComponent,CommonModule]
})
export class HomeComponent {
  constructor(private router:Router) {  
  }

  loginPopup: boolean = false;
  handleLoginPopup() {
    this.loginPopup = true;
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  closeLoginPopup() {
    this.loginPopup = false;
  }
}
