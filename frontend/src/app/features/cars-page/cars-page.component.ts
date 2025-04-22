import { Component } from '@angular/core';
import { CarDetailComponent } from '../../shared/car-detail/car-detail.component';

@Component({
  selector: 'app-cars-page',
  imports: [CarDetailComponent],
  templateUrl: './cars-page.component.html',
  styleUrl: './cars-page.component.css'
})
export class CarsPageComponent {
  title = 'frontend';

  openCarDetailsPopup() {
    document.getElementById("carDetailPopup")?.classList.remove("hidden");
  }


}
