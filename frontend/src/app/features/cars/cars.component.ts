import { Component } from '@angular/core';
import { CarFilterComponent } from "../car-filter/car-filter.component";
import { CardsComponent } from "../cards/cards.component";
import { AboutUsComponent } from "../about-us/about-us.component";
import { ReviewSliderComponent } from "../review-slider/review-slider.component";
import { FaqComponent } from "../faq/faq.component";

@Component({
  selector: 'app-cars',
  imports: [CarFilterComponent, CardsComponent, AboutUsComponent, ReviewSliderComponent, FaqComponent],
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.css'
})
export class CarsComponent {

}
