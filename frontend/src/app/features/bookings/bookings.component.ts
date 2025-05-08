import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

interface Booking {
  date: string;
  bookingNumber: string;
  client: string;
  car: string;
  madeBy: string;
  bookingStatus: string;
  bookingPeriod: string;
  // Add these properties for date filtering
  startDate: Date;
  endDate: Date;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatIconModule
  ],
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
  
  // Date range for the calendar
  selectedDateRange: DateRange = {
    start: new Date(2024, 10, 1), // November 1, 2024
    end: new Date(2024, 10, 15)   // November 15, 2024
  };
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      client: ['All'],
      bookingStatus: ['All'],
      startDate: [this.selectedDateRange.start],
      endDate: [this.selectedDateRange.end]
    });
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

  applyFilters(): void {
    const clientFilter = this.filterForm.get('client')?.value;
    const statusFilter = this.filterForm.get('bookingStatus')?.value;
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;
    
    this.filteredBookings = this.bookings.filter(booking => {
      // Apply client filter if not "All"
      const clientMatch = clientFilter === 'All' || booking.client === clientFilter;
      
      // Apply status filter if not "All"
      const statusMatch = statusFilter === 'All' || booking.bookingStatus === statusFilter;
      
      // Apply date range filter if dates are selected
      let dateMatch = true;
      if (startDate && endDate) {
        // Check if booking period overlaps with selected date range
        dateMatch = (
          (booking.startDate <= endDate && booking.endDate >= startDate) ||
          (booking.date >= this.formatDate(startDate) && booking.date <= this.formatDate(endDate))
        );
      }
      
      return clientMatch && statusMatch && dateMatch;
    });
    
    // Update the displayed date range
    if (startDate && endDate) {
      this.dateRange = `${this.formatDateShort(startDate)} - ${this.formatDateShort(endDate)}`;
    }
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

  updateDateRange(): void {
    const startDate = this.filterForm.get('startDate')?.value;
    const endDate = this.filterForm.get('endDate')?.value;
    
    if (startDate && endDate) {
      this.selectedDateRange = { start: startDate, end: endDate };
      this.showDatepicker = false;
      this.applyFilters();
    }
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