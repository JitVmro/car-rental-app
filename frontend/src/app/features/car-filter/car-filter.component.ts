
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CarFilterService } from '../../core/services/car-filter.service';
import { FilterCriteria } from '../../models/filter.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-car-filter',
  templateUrl: './car-filter.component.html',
  styleUrls: ['./car-filter.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true
})
export class CarFilterComponent implements OnInit {
  filterForm: FormGroup;
  locations: string[] = [];
  carCategories: string[] = [];
  gearboxTypes: string[] = [];
  engineTypes: string[] = [];
  
  minPrice: number = 50;
  maxPrice: number = 700;
  
  // Calendar related properties
  showPickupCalendar: boolean = false;
  showDropoffCalendar: boolean = false;
  currentMonth: Date = new Date();
  selectedPickupDate: Date = new Date();
  selectedDropoffDate: Date = new Date();
  
  // Initialize with default dates (today + 2 days for pickup, today + 4 days for dropoff)
  constructor(
    private fb: FormBuilder,
    private carFilterService: CarFilterService
  ) {
    this.selectedPickupDate.setDate(this.selectedPickupDate.getDate() + 2);
    this.selectedDropoffDate.setDate(this.selectedDropoffDate.getDate() + 4);
    
    this.filterForm = this.fb.group({
      pickupLocation: [''],
      dropoffLocation: [''],
      pickupDate: [this.formatDate(this.selectedPickupDate)],
      dropoffDate: [this.formatDate(this.selectedDropoffDate)],
      carCategory: [''],
      gearboxType: [''],
      engineType: [''],
      priceRange: [[this.minPrice, this.maxPrice]]
    });
  }

  ngOnInit(): void {
    // Load filter options
    this.locations = this.carFilterService.getLocations();
    this.carCategories = this.carFilterService.getCarCategories();
    this.gearboxTypes = this.carFilterService.getGearboxTypes();
    this.engineTypes = this.carFilterService.getEngineTypes();
    
    // Apply initial filters to show all cars by default
    this.findCars();
  }

  findCars(): void {
    const formValues = this.filterForm.value;
    
    const filters: FilterCriteria = {
      pickupLocation: formValues.pickupLocation,
      dropoffLocation: formValues.dropoffLocation,
      pickupDate: formValues.pickupDate,
      dropoffDate: formValues.dropoffDate,
      carCategory: formValues.carCategory,
      gearboxType: formValues.gearboxType,
      engineType: formValues.engineType,
      minPrice: formValues.priceRange[0],
      maxPrice: formValues.priceRange[1]
    };
    
    this.carFilterService.filterCars(filters);
  }

  clearFilters(): void {
    // Reset form values
    this.filterForm.patchValue({
      pickupLocation: '',
      dropoffLocation: '',
      pickupDate: this.formatDate(this.selectedPickupDate),
      dropoffDate: this.formatDate(this.selectedDropoffDate),
      carCategory: '',
      gearboxType: '',
      engineType: '',
      priceRange: [this.minPrice, this.maxPrice]
    });
    
    // Reset all filters in the service
    this.carFilterService.resetFilters();
  }

  // Calendar related methods
  togglePickupCalendar(): void {
    this.showPickupCalendar = !this.showPickupCalendar;
    if (this.showPickupCalendar) {
      this.showDropoffCalendar = false;
    }
  }

  toggleDropoffCalendar(): void {
    this.showDropoffCalendar = !this.showDropoffCalendar;
    if (this.showDropoffCalendar) {
      this.showPickupCalendar = false;
    }
  }

  selectDate(type: 'pickup' | 'dropoff', date: Date): void {
    if (type === 'pickup') {
      this.selectedPickupDate = date;
      this.filterForm.patchValue({ pickupDate: this.formatDate(date) });
      this.showPickupCalendar = false;
    } else {
      this.selectedDropoffDate = date;
      this.filterForm.patchValue({ dropoffDate: this.formatDate(date) });
      this.showDropoffCalendar = false;
    }
  }

  formatDate(date: Date): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }

  getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  getMonthDays(): { day: number, date: Date, isCurrentMonth: boolean }[] {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const daysInMonth = this.getDaysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    // Get days from previous month to fill the calendar
    const daysInPrevMonth = this.getDaysInMonth(year, month - 1);
    const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => {
      const day = daysInPrevMonth - firstDayOfMonth + i + 1;
      const date = new Date(year, month - 1, day);
      return { day, date, isCurrentMonth: false };
    });
    
    // Current month days
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month, day);
      return { day, date, isCurrentMonth: true };
    });
    
    // Next month days to fill the remaining cells
    const totalDaysShown = 42; // 6 rows of 7 days
    const nextMonthDaysNeeded = totalDaysShown - prevMonthDays.length - currentMonthDays.length;
    const nextMonthDays = Array.from({ length: nextMonthDaysNeeded }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month + 1, day);
      return { day, date, isCurrentMonth: false };
    });
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }

  prevMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
  }

  getCurrentMonthName(): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[this.currentMonth.getMonth()]} ${this.currentMonth.getFullYear()}`;
  }

  isDateSelected(date: Date, type: 'pickup' | 'dropoff'): boolean {
    const compareDate = type === 'pickup' ? this.selectedPickupDate : this.selectedDropoffDate;
    return date.getDate() === compareDate.getDate() && 
           date.getMonth() === compareDate.getMonth() && 
           date.getFullYear() === compareDate.getFullYear();
  }

  isDateDisabled(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  updatePriceRange(event: any): void {
    const currentRange = this.filterForm.get('priceRange')?.value;
    this.filterForm.patchValue({
      priceRange: [currentRange[0], parseInt(event.target.value)]
    });
  }

  closeCalendars(): void {
    this.showPickupCalendar = false;
    this.showDropoffCalendar = false;
  }
}