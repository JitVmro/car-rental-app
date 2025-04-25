import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarBookingEditComponent } from './car-booking-edit.component';

describe('CarBookingEditComponent', () => {
  let component: CarBookingEditComponent;
  let fixture: ComponentFixture<CarBookingEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarBookingEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarBookingEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
