import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingsSectionComponent } from './bookings-section.component';

describe('BookingsSectionComponent', () => {
  let component: BookingsSectionComponent;
  let fixture: ComponentFixture<BookingsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
