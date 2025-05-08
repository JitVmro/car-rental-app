import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth-service.service';

interface Booking {
  date: string;
  bookingNumber: string;
  client: string;
  car: string;
  madeBy: string;
  bookingStatus: string;
  bookingPeriod: string;
  startDate: Date;
  endDate: Date;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface CalendarDay {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css']
})
export class BookingsComponent implements OnInit {
  filterForm: FormGroup;
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  showClientDropdown = false;
  showStatusDropdown = false;
  showDatepicker = false;
  showActionMenu = false;
  selectedBookingIndex: number | null = null;
  successMessage: string | null = null;
  clients: string[] = ['All', 'Lily Hope', 'Matteo Rossi', 'Ramesh Kumar'];
  statuses: string[] = ['All', 'Reserved', 'Service started', 'Service provided', 'Booking finished'];
  dateRange = 'Nov 01 - Nov 15, 2024';
  
  // Calendar variables
  currentMonth: Date = new Date();
  nextMonth: Date = new Date();
  calendarDays: CalendarDay[] = [];
  nextCalendarDays: CalendarDay[] = [];
  weekdays: string[] = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  months: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Selected dates
  selectedStartDate: Date | null = new Date(2024, 10, 1); // Nov 1, 2024
  selectedEndDate: Date | null = new Date(2024, 10, 15);  // Nov 15, 2024
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      client: ['All'],
      bookingStatus: ['All']
    });
    
    // Initialize next month
    this.nextMonth = new Date(this.currentMonth);
    this.nextMonth.setMonth(this.currentMonth.getMonth() + 1);
  }

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Check if user is support agent
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.role !== 'SupportAgent') {
      // If not support agent, redirect to appropriate page
      this.router.navigate(['/home']);
      return;
    }
    
    // Initialize mock data
    this.initializeBookings();
    
    // Generate calendar days
    this.generateCalendar();
    
    // Apply initial filtering
    this.applyFilters();
    
    // Subscribe to form changes for filtering
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
    
    // Check for success message in query params
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    if (success === 'true') {
      this.successMessage = 'Congratulations! New booking was successfully created';
      
      // Auto-hide the success message after 5 seconds
      setTimeout(() => {
        this.successMessage = null;
      }, 5000);
    }
  }

  initializeBookings(): void {
    // Parse the date strings to Date objects for filtering
    this.bookings = [
      {
        date: '05.11.2024',
        bookingNumber: '2437',
        client: 'Lily Hope',
        car: 'Nissan Juke',
        madeBy: 'Client',
        bookingStatus: 'Service provided',
        bookingPeriod: 'Oct 25 - Nov 05',
        startDate: new Date(2024, 9, 25), // Oct 25, 2024
        endDate: new Date(2024, 10, 5)    // Nov 5, 2024
      },
      {
        date: '08.11.2024',
        bookingNumber: '2454',
        client: 'Matteo Rossi',
        car: 'Fiat Ageia',
        madeBy: 'Client',
        bookingStatus: 'Booking finished',
        bookingPeriod: 'Oct 28 - Nov 01',
        startDate: new Date(2024, 9, 28), // Oct 28, 2024
        endDate: new Date(2024, 10, 1)    // Nov 1, 2024
      },
      {
        date: '10.11.2024',
        bookingNumber: '3347',
        client: 'Ramesh Kumar',
        car: 'Toyota Prius',
        madeBy: 'Support agent',
        bookingStatus: 'Service started',
        bookingPeriod: 'Nov 11 - Nov 16',
        startDate: new Date(2024, 10, 11), // Nov 11, 2024
        endDate: new Date(2024, 10, 16)    // Nov 16, 2024
      },
      {
        date: '15.11.2024',
        bookingNumber: '5466',
        client: 'Lily Hope',
        car: 'Audi A6 Quattro',
        madeBy: 'Client',
        bookingStatus: 'Reserved',
        bookingPeriod: 'Nov 11 - Nov 16',
        startDate: new Date(2024, 10, 11), // Nov 11, 2024
        endDate: new Date(2024, 10, 16)    // Nov 16, 2024
      }
    ];
    
    this.filteredBookings = [...this.bookings];
  }

  generateCalendar(): void {
    // Generate current month calendar
    this.calendarDays = this.getCalendarDays(this.currentMonth);
    
    // Generate next month calendar
    this.nextCalendarDays = this.getCalendarDays(this.nextMonth);
  }

  getCalendarDays(month: Date): CalendarDay[] {
    const days: CalendarDay[] = [];
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    
    // Get first day of month
    const firstDay = new Date(year, monthIndex, 1);
    // Get last day of month
    const lastDay = new Date(year, monthIndex + 1, 0);
    
    // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDay.getDay();
    // Convert Sunday (0) to 7 to match our calendar layout where Monday is first
    firstDayOfWeek = firstDayOfWeek === 0 ? 7 : firstDayOfWeek;
    
    // Add days from previous month
    const daysFromPrevMonth = firstDayOfWeek - 1;
    if (daysFromPrevMonth > 0) {
      const prevMonth = new Date(year, monthIndex - 1, 1);
      const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
      
      for (let i = prevMonthLastDay - daysFromPrevMonth + 1; i <= prevMonthLastDay; i++) {
        days.push({
          date: i,
          month: prevMonth.getMonth(),
          year: prevMonth.getFullYear(),
          isCurrentMonth: false,
          isSelected: this.isDateSelected(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), i)),
          isToday: this.isToday(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), i))
        });
      }
    }
    
    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({
        date: i,
        month: monthIndex,
        year: year,
        isCurrentMonth: true,
        isSelected: this.isDateSelected(new Date(year, monthIndex, i)),
        isToday: this.isToday(new Date(year, monthIndex, i))
      });
    }
    
    // Add days from next month to complete the grid (6 rows x 7 days = 42 cells)
    const totalDays = 42;
    const remainingDays = totalDays - days.length;
    
    if (remainingDays > 0) {
      const nextMonth = new Date(year, monthIndex + 1, 1);
      
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: i,
          month: nextMonth.getMonth(),
          year: nextMonth.getFullYear(),
          isCurrentMonth: false,
          isSelected: this.isDateSelected(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i)),
          isToday: this.isToday(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i))
        });
      }
    }
    
    return days;
  }

  isDateSelected(date: Date): boolean {
    if (!this.selectedStartDate && !this.selectedEndDate) return false;
    
    const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (this.selectedStartDate && this.selectedEndDate) {
      const start = new Date(this.selectedStartDate.getFullYear(), this.selectedStartDate.getMonth(), this.selectedStartDate.getDate());
      const end = new Date(this.selectedEndDate.getFullYear(), this.selectedEndDate.getMonth(), this.selectedEndDate.getDate());
      return dateWithoutTime >= start && dateWithoutTime <= end;
    } else if (this.selectedStartDate) {
      const start = new Date(this.selectedStartDate.getFullYear(), this.selectedStartDate.getMonth(), this.selectedStartDate.getDate());
      return dateWithoutTime.getTime() === start.getTime();
    }
    
    return false;
  }

  // Check if a date is exactly one of the selected boundary dates (start or end)
  isExactSelectedDate(date: Date): boolean {
    if (!this.selectedStartDate) return false;
    
    const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const start = this.selectedStartDate ? new Date(this.selectedStartDate.getFullYear(), this.selectedStartDate.getMonth(), this.selectedStartDate.getDate()) : null;
    const end = this.selectedEndDate ? new Date(this.selectedEndDate.getFullYear(), this.selectedEndDate.getMonth(), this.selectedEndDate.getDate()) : null;
    
    if (start && dateWithoutTime.getTime() === start.getTime()) return true;
    if (end && dateWithoutTime.getTime() === end.getTime()) return true;
    
    return false;
  }

  // Check if a date is between the selected range but not a boundary
  isDateInRange(date: Date): boolean {
    if (!this.selectedStartDate || !this.selectedEndDate) return false;
    
    const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const start = new Date(this.selectedStartDate.getFullYear(), this.selectedStartDate.getMonth(), this.selectedStartDate.getDate());
    const end = new Date(this.selectedEndDate.getFullYear(), this.selectedEndDate.getMonth(), this.selectedEndDate.getDate());
    
    return dateWithoutTime > start && dateWithoutTime < end;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  }

  selectDate(day: CalendarDay): void {
    const selectedDate = new Date(day.year, day.month, day.date);
    
    if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate)) {
      // Start new selection
      this.selectedStartDate = selectedDate;
      this.selectedEndDate = null;
    } else {
      // Complete the selection
      if (selectedDate < this.selectedStartDate) {
        this.selectedEndDate = this.selectedStartDate;
        this.selectedStartDate = selectedDate;
      } else {
        this.selectedEndDate = selectedDate;
      }
    }
    
    // Update calendar to reflect selection
    this.generateCalendar();
    
    // If we have both start and end dates, update the date range display
    if (this.selectedStartDate && this.selectedEndDate) {
      this.dateRange = `${this.formatDateShort(this.selectedStartDate)} - ${this.formatDateShort(this.selectedEndDate)}`;
    } else if (this.selectedStartDate) {
      this.dateRange = `${this.formatDateShort(this.selectedStartDate)}`;
    }
  }

  changeMonth(increment: number): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + increment);
    this.nextMonth.setMonth(this.nextMonth.getMonth() + increment);
    this.generateCalendar();
  }

  applyDateSelection(): void {
    if (this.selectedStartDate && this.selectedEndDate) {
      this.applyFilters();
      this.showDatepicker = false;
    }
  }

  applyFilters(): void {
    const clientFilter = this.filterForm.get('client')?.value;
    const statusFilter = this.filterForm.get('bookingStatus')?.value;
    
    this.filteredBookings = this.bookings.filter(booking => {
      // Apply client filter if not "All"
      const clientMatch = clientFilter === 'All' || booking.client === clientFilter;
      
      // Apply status filter if not "All"
      const statusMatch = statusFilter === 'All' || booking.bookingStatus === statusFilter;
      
      // Apply date range filter if dates are selected
      let dateMatch = true;
      if (this.selectedStartDate && this.selectedEndDate) {
        // Check if booking period overlaps with selected date range
        dateMatch = (
          (booking.startDate <= this.selectedEndDate && booking.endDate >= this.selectedStartDate) ||
          (new Date(this.parseDate(booking.date)) >= this.selectedStartDate && 
           new Date(this.parseDate(booking.date)) <= this.selectedEndDate)
        );
      }
      
      return clientMatch && statusMatch && dateMatch;
    });
  }

  // Parse date string in format DD.MM.YYYY to Date object
  parseDate(dateStr: string): Date {
    const parts = dateStr.split('.');
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }

  toggleDropdown(dropdown: string): void {
    if (dropdown === 'client') {
      this.showClientDropdown = !this.showClientDropdown;
      this.showStatusDropdown = false;
      this.showDatepicker = false;
    } else if (dropdown === 'status') {
      this.showStatusDropdown = !this.showStatusDropdown;
      this.showClientDropdown = false;
      this.showDatepicker = false;
    } else if (dropdown === 'date') {
      this.showDatepicker = !this.showDatepicker;
      this.showClientDropdown = false;
      this.showStatusDropdown = false;
    }
  }

  selectClient(client: string): void {
    this.filterForm.patchValue({ client });
    this.showClientDropdown = false;
  }

  selectStatus(status: string): void {
    this.filterForm.patchValue({ bookingStatus: status });
    this.showStatusDropdown = false;
  }

  applyDateFilters(): void {
    this.toggleDropdown('date');
  }

  // Format date as DD.MM.YYYY for comparison with booking.date
  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  // Format date as MMM DD for display in the date range button
  formatDateShort(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }

  toggleActionMenu(index: number): void {
    if (this.selectedBookingIndex === index) {
      this.selectedBookingIndex = null;
      this.showActionMenu = false;
    } else {
      this.selectedBookingIndex = index;
      this.showActionMenu = true;
    }
  }

  viewDetails(): void {
    // Navigate to booking details page
    this.showActionMenu = false;
  }

  cancelBooking(): void {
    // Cancel booking logic
    this.showActionMenu = false;
  }

  createNewBooking(): void {
    this.router.navigate(['/cars']);
  }

  closeSuccessMessage(): void {
    this.successMessage = null;
  }
  // Helper method to create a Date object from a CalendarDay
createDate(day: CalendarDay): Date {
  return new Date(day.year, day.month, day.date);
}
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Close dropdowns when clicking outside
    if (!(event.target as HTMLElement).closest('.dropdown-container')) {
      this.showClientDropdown = false;
      this.showStatusDropdown = false;
      this.showActionMenu = false;
    }
    
    // Don't close datepicker when clicking inside it
    if (!(event.target as HTMLElement).closest('.datepicker-container') && 
        !(event.target as HTMLElement).closest('.date-button')) {
      this.showDatepicker = false;
    }
  }
}