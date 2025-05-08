import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CarFilterService } from '../../core/services/car-filter.service';
import { FilterCriteria } from '../../models/filter.model';
import { CommonModule } from '@angular/common';
import { CarsService } from '../../core/services/cars/cars.service';
import { filter } from 'rxjs';
import { Router } from '@angular/router';
import { CardsComponent } from '../cards/cards.component';

@Component({
  selector: 'app-car-filter',
  templateUrl: './car-filter.component.html',
  styleUrls: ['./car-filter.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
})
export class CarFilterComponent implements OnInit {
  filterForm: FormGroup;
  locations: string[] = [];
  carCategories: string[] = [];
  gearboxTypes: string[] = [];
  engineTypes: string[] = [];

  minPrice: number = 50;
  maxPrice: number = 1500;
  draggingHandle: 'min' | 'max' | null = null;
  sliderElement: HTMLElement | null = null;
  touchStartX: number | null = null;
  touchStartValue: number | null = null;

  showPickupCalendar = false;
  showDropoffCalendar = false;
  currentMonth: Date = new Date();
  selectedPickupDate: Date = new Date();
  selectedDropoffDate: Date = new Date();

  @Output() filteredCars: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private carFilterService: CarFilterService,
    private carsService: CarsService,
    private router: Router,
  ) {
    this.selectedPickupDate.setDate(this.selectedPickupDate.getDate());
    this.selectedDropoffDate.setDate(this.selectedPickupDate.getDate() + 1);

    this.filterForm = this.fb.group({
      pickupLocation: [''],
      dropoffLocation: [''],
      pickupDate: [this.formatDate(this.selectedPickupDate)],
      dropoffDate: [this.formatDate(this.selectedDropoffDate)],
      carCategory: [''],
      gearboxType: [''],
      engineType: [''],
      priceRange: [[this.minPrice, this.maxPrice]],
    });
  }

  ngOnInit(): void {
    this.locations = this.carFilterService.getLocations();
    this.carCategories = this.carFilterService.getCarCategories();
    this.gearboxTypes = this.carFilterService.getgearBoxTypes();
    this.engineTypes = this.carFilterService.getEngineTypes();
  }

  findCars(): void {
    const formValues = this.filterForm.value;
    const filters: FilterCriteria = {
      pickupLocationId: "" + this.locations.indexOf(formValues.pickupLocation),
      dropoffLocationId: "" + this.locations.indexOf(formValues.pickupLocation),
      category: formValues.carCategory,
      gearBoxType: formValues.gearboxType,
      fuelType: formValues.engineType,
      minPrice: formValues.priceRange[0],
      maxPrice: formValues.priceRange[1],
    };
    this.carsService.getFilteredCar(filters).subscribe(data => {
      console.log(filters)
      this.filteredCars.emit(data.content);
    });
    this.router.navigate(["/cars"])
  }

  clearFilters(): void {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    this.selectedPickupDate = today;
    this.selectedDropoffDate = tomorrow;

    this.filterForm.patchValue({
      pickupLocation: '',
      dropoffLocation: '',
      pickupDate: this.formatDate(today),
      dropoffDate: this.formatDate(tomorrow),
      carCategory: '',
      gearboxType: '',
      engineType: '',
      priceRange: [this.minPrice, this.maxPrice],
    });

    this.carFilterService.resetFilters();
  }

  togglePickupCalendar(): void {
    this.showPickupCalendar = !this.showPickupCalendar;
    if (this.showPickupCalendar) this.showDropoffCalendar = false;
    // Reset current month to match selected date
    this.currentMonth = new Date(
      this.selectedPickupDate.getFullYear(),
      this.selectedPickupDate.getMonth(),
      1
    );
  }

  toggleDropoffCalendar(): void {
    this.showDropoffCalendar = !this.showDropoffCalendar;
    if (this.showDropoffCalendar) this.showPickupCalendar = false;
    // Reset current month to match selected date
    this.currentMonth = new Date(
      this.selectedDropoffDate.getFullYear(),
      this.selectedDropoffDate.getMonth(),
      1
    );
  }

  selectDate(type: 'pickup' | 'dropoff', date: Date): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;

    if (type === 'pickup') {
      this.selectedPickupDate = new Date(date);
      this.filterForm.patchValue({ pickupDate: this.formatDate(date) });

      // If pickup date is after dropoff date, adjust dropoff date
      if (this.selectedDropoffDate < date) {
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);
        this.selectedDropoffDate = nextDay;
        this.filterForm.patchValue({ dropoffDate: this.formatDate(nextDay) });
      }

      this.showPickupCalendar = false;
    } else {
      // Allow same day for dropoff (Issue 1 fix)
      if (date < this.selectedPickupDate) return;

      this.selectedDropoffDate = new Date(date);
      this.filterForm.patchValue({ dropoffDate: this.formatDate(date) });
      this.showDropoffCalendar = false;
    }
  }

  formatDate(date: Date): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }

  getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  getMonthDays(): { day: number; date: Date; isCurrentMonth: boolean }[] {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const daysInMonth = this.getDaysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const daysInPrevMonth = this.getDaysInMonth(year, month - 1);
    const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
      const day = daysInPrevMonth - firstDayOfMonth + i + 1;
      const date = new Date(year, month - 1, day);
      return { day, date, isCurrentMonth: false };
    });

    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month, day);
      return { day, date, isCurrentMonth: true };
    });

    const totalDaysShown = 42;
    const nextMonthDaysNeeded =
      totalDaysShown - prevMonthDays.length - currentMonthDays.length;
    const nextMonthDays = Array.from(
      { length: nextMonthDaysNeeded },
      (_, i) => {
        const day = i + 1;
        const date = new Date(year, month + 1, day);
        return { day, date, isCurrentMonth: false };
      }
    );

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }

  prevMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
  }

  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
  }

  getCurrentMonthName(): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${months[this.currentMonth.getMonth()]
      } ${this.currentMonth.getFullYear()}`;
  }

  isDateSelected(date: Date, type: 'pickup' | 'dropoff'): boolean {
    const compareDate =
      type === 'pickup' ? this.selectedPickupDate : this.selectedDropoffDate;
    return (
      date.getDate() === compareDate.getDate() &&
      date.getMonth() === compareDate.getMonth() &&
      date.getFullYear() === compareDate.getFullYear()
    );
  }

  isDateDisabled(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  // Fixed to allow same day selection for dropoff (Issue 1)
  isDropoffDateDisabled(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // For pickup calendar, only disable dates before today
    if (!this.showDropoffCalendar) {
      return date < today;
    }

    // For dropoff calendar, disable dates before today and before pickup date
    return date < today || date < this.selectedPickupDate;
  }

  closeCalendars(): void {
    this.showPickupCalendar = false;
    this.showDropoffCalendar = false;
  }

  // Update these methods
  startDragging(handle: 'min' | 'max', event: MouseEvent | TouchEvent): void {
    this.draggingHandle = handle;
    this.sliderElement = (event.target as HTMLElement).closest('.px-2');
    if (!this.sliderElement) return;
    const currentRange = this.filterForm.get('priceRange')?.value;
    if (event instanceof TouchEvent) {
      this.touchStartX = event.touches[0].clientX;
      this.touchStartValue =
        handle === 'min' ? currentRange[0] : currentRange[1];

      document.addEventListener('touchmove', this.onTouchMove, {
        passive: false,
      });
      document.addEventListener('touchend', this.stopDragging);
    } else {
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.stopDragging);
    }

    event.preventDefault();
    event.stopPropagation();
  }

  onMouseMove = (event: MouseEvent): void => {
    if (!this.draggingHandle || !this.sliderElement) return;
    this.updateSliderPosition(event.clientX);
  };

  onTouchMove = (event: TouchEvent): void => {
    if (
      !this.draggingHandle ||
      !this.sliderElement ||
      this.touchStartX === null ||
      this.touchStartValue === null
    )
      return;

    event.preventDefault();
    event.stopPropagation();

    this.updateSliderPosition(event.touches[0].clientX);
  };

  updateSliderPosition(clientX: number): void {
    if (!this.sliderElement) return;

    const sliderRect = this.sliderElement.getBoundingClientRect();
    const sliderWidth = sliderRect.width;

    let percentage = (clientX - sliderRect.left) / sliderWidth;
    percentage = Math.max(0, Math.min(1, percentage));

    const value = Math.round(
      this.minPrice + percentage * (this.maxPrice - this.minPrice)
    );

    const currentRange = [...this.filterForm.get('priceRange')?.value];

    if (this.draggingHandle === 'min') {
      currentRange[0] = Math.min(value, currentRange[1] - 1);
      currentRange[0] = Math.max(this.minPrice, currentRange[0]);
    } else {
      currentRange[1] = Math.max(value, currentRange[0] + 1);
      currentRange[1] = Math.min(this.maxPrice, currentRange[1]);
    }

    this.filterForm.patchValue({
      priceRange: currentRange,
    });
  }

  stopDragging = (): void => {
    this.draggingHandle = null;
    this.sliderElement = null;
    this.touchStartX = null;
    this.touchStartValue = null;

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.stopDragging);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.stopDragging);
  };

  ngOnDestroy(): void {
    this.stopDragging();
  }
}