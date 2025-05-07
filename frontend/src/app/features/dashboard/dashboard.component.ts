import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth/auth-service.service';
import { ReportData, ReportFilter } from '../../models/report.model';
import { CommonModule } from '@angular/common';

interface CalendarDate {
  day: number;
  month: number;
  year: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  filterForm: FormGroup;
  reportTypes: string[] = [];
  locations: string[] = [];
  reportData: ReportData[] = [];
  isLoading = false;
  showReportTypeDropdown = false;
  showPeriodDropdown = false;
  showLocationDropdown = false;
  showExportOptions = false;
  
  // Calendar related properties
  displayedMonths: { month: number, year: number }[] = [
    { month: 10, year: 2024 }, // November (0-indexed)
    { month: 11, year: 2024 }  // December (0-indexed)
  ];
  selectedStartDate: CalendarDate = { day: 1, month: 10, year: 2024 }; // 1st of November 2024
  selectedEndDate: CalendarDate | null = { day: 30, month: 11, year: 2024 }; // 30th of December 2024
  calendarData: { [key: string]: any[] } = {};
  weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      reportType: ['Sales report'],
      period: [`Nov 01 - Dec 30, 2024`],
      location: ['Rome']
    });
  }

  ngOnInit(): void {
    // Check if user is logged in and is admin
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.role !== 'admin') {
      // If user is logged in but not admin, redirect to appropriate page
      this.router.navigate(['/home']);
      return;
    }
    
    // Load report types and locations
    this.dashboardService.getReportTypes().subscribe(types => {
      this.reportTypes = types;
    });
    
    this.dashboardService.getLocations().subscribe(locations => {
      this.locations = locations;
    });
    
    // Initialize calendar
    this.generateCalendarData();
    
    // Update period display
    this.updatePeriodDisplay();
  }

  // In your component.ts file, update the generateCalendarData method to properly mark selected dates

generateCalendarData(): void {
  this.calendarData = {};
  
  this.displayedMonths.forEach(({ month, year }) => {
    const days = this.getDaysInMonth(month, year);
    this.calendarData[`${month}-${year}`] = days;
  });
}



  getDaysInMonth(month: number, year: number): any[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDay.getDay();
    // Adjust for Monday as first day of week (0 = Monday, 6 = Sunday)
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const days = [];
    
    // Add days from previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = prevMonth === 11 && month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({
        day: daysInPrevMonth - firstDayOfWeek + i + 1,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        isSelected: this.isSelectedDate(daysInPrevMonth - firstDayOfWeek + i + 1, prevMonth, prevYear),
        isToday: this.isToday(daysInPrevMonth - firstDayOfWeek + i + 1, prevMonth, prevYear)
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: month,
        year: year,
        isCurrentMonth: true,
        isSelected: this.isSelectedDate(i, month, year),
        isToday: this.isToday(i, month, year)
      });
    }
    
    // Add days from next month
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = nextMonth === 0 && month === 11 ? year + 1 : year;
    
    const totalDaysNeeded = 42; // 6 rows of 7 days
    const remainingDays = totalDaysNeeded - days.length;
    
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        isSelected: this.isSelectedDate(i, nextMonth, nextYear),
        isToday: this.isToday(i, nextMonth, nextYear)
      });
    }
    
    return days;
  }

  isToday(day: number, month: number, year: number): boolean {
    const today = new Date();
    return Boolean(today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year);
  }
// Update isSelectedDate to also check for dates between the selected range
// Add this method to your component class
isSelectedDate(day: number, month: number, year: number): boolean {
  // Check if this is the start date
  const isStartDate = this.selectedStartDate && 
                     this.selectedStartDate.day === day && 
                     this.selectedStartDate.month === month && 
                     this.selectedStartDate.year === year;
                     
  // Check if this is the end date (if we have one)
  const isEndDate = this.selectedEndDate && 
                   this.selectedEndDate.day === day && 
                   this.selectedEndDate.month === month && 
                   this.selectedEndDate.year === year;
  
  // Return true only for exact start or end dates
  return Boolean(isStartDate || isEndDate);
}
  toggleDropdown(dropdown: string): void {
    switch (dropdown) {
      case 'reportType':
        this.showReportTypeDropdown = !this.showReportTypeDropdown;
        this.showPeriodDropdown = false;
        this.showLocationDropdown = false;
        this.showExportOptions = false;
        break;
      case 'period':
        this.showPeriodDropdown = !this.showPeriodDropdown;
        this.showReportTypeDropdown = false;
        this.showLocationDropdown = false;
        this.showExportOptions = false;
        break;
      case 'location':
        this.showLocationDropdown = !this.showLocationDropdown;
        this.showReportTypeDropdown = false;
        this.showPeriodDropdown = false;
        this.showExportOptions = false;
        break;
    }
  }

  selectReportType(type: string): void {
    this.filterForm.patchValue({ reportType: type });
    this.showReportTypeDropdown = false;
    
    // If we already have report data, refresh it with the new report type
    if (this.reportData.length > 0) {
      this.createReport();
    }
  }

  selectLocation(location: string): void {
    this.filterForm.patchValue({ location });
    this.showLocationDropdown = false;
    
    // If we already have report data, refresh it with the new location
    if (this.reportData.length > 0) {
      this.createReport();
    }
  }

  selectDay(day: any): void {
    // Only allow selecting days in the current month
    if (!day.isCurrentMonth) return;
    
    // Implement date range selection
    // If no start date is selected or both dates are selected, set this as start date
    if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate)) {
      this.selectedStartDate = {
        day: day.day,
        month: day.month,
        year: day.year
      };
      this.selectedEndDate = null;
      
      // Update period display for single date selection
      this.updatePeriodDisplay();
    } 
    // If only start date is selected, set this as end date (if it's after start date)
    else if (this.selectedStartDate && !this.selectedEndDate) {
      const startDate = new Date(
        this.selectedStartDate.year,
        this.selectedStartDate.month,
        this.selectedStartDate.day
      );
      
      const selectedDate = new Date(day.year, day.month, day.day);
      
      if (selectedDate > startDate) {
        this.selectedEndDate = {
          day: day.day,
          month: day.month,
          year: day.year
        };
      } else {
        // If selected date is before start date, swap them
        this.selectedEndDate = { ...this.selectedStartDate };
        this.selectedStartDate = {
          day: day.day,
          month: day.month,
          year: day.year
        };
      }
      
      // Update period display for date range
      this.updatePeriodDisplay();
      
      // If we already have report data, refresh it with the new date range
      if (this.reportData.length > 0) {
        this.createReport();
      }
    }
    
    // Update calendar data to reflect selection
    this.generateCalendarData();
  }

  updatePeriodDisplay(): void {
    if (this.selectedStartDate && this.selectedEndDate) {
      const startMonth = this.monthNames[this.selectedStartDate.month].substring(0, 3);
      const endMonth = this.monthNames[this.selectedEndDate.month].substring(0, 3);
      
      this.filterForm.patchValue({ 
        period: `${startMonth} ${this.padZero(this.selectedStartDate.day)} - ${endMonth} ${this.padZero(this.selectedEndDate.day)}, ${this.selectedStartDate.year}` 
      });
    } else if (this.selectedStartDate) {
      const startMonth = this.monthNames[this.selectedStartDate.month].substring(0, 3);
      
      this.filterForm.patchValue({ 
        period: `${startMonth} ${this.padZero(this.selectedStartDate.day)} - Select end date` 
      });
    } else {
      // Default period
      const startMonth = this.monthNames[this.displayedMonths[0].month].substring(0, 3);
      const endMonth = this.monthNames[this.displayedMonths[1].month].substring(0, 3);
      
      this.filterForm.patchValue({ 
        period: `${startMonth} 01 - ${endMonth} 30, ${this.displayedMonths[0].year}` 
      });
    }
  }

  padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  navigateMonth(direction: number): void {
    // Update both displayed months
    this.displayedMonths = this.displayedMonths.map(({ month, year }) => {
      let newMonth = month + direction;
      let newYear = year;
      
      if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      } else if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      }
      
      return { month: newMonth, year: newYear };
    });
    
    // Regenerate calendar data
    this.generateCalendarData();
  }

  createReport(): void {
    this.isLoading = true;
    
    // Format dates for API
    let startDate: string;
    let endDate: string;
    
    if (this.selectedStartDate && this.selectedEndDate) {
      startDate = `${this.selectedStartDate.year}-${this.padZero(this.selectedStartDate.month + 1)}-${this.padZero(this.selectedStartDate.day)}`;
      endDate = `${this.selectedEndDate.year}-${this.padZero(this.selectedEndDate.month + 1)}-${this.padZero(this.selectedEndDate.day)}`;
    } else if (this.selectedStartDate) {
      // If only start date is selected, use it for both start and end
      startDate = `${this.selectedStartDate.year}-${this.padZero(this.selectedStartDate.month + 1)}-${this.padZero(this.selectedStartDate.day)}`;
      endDate = startDate;
    } else {
      // Default to current displayed months
      startDate = `${this.displayedMonths[0].year}-${this.padZero(this.displayedMonths[0].month + 1)}-01`;
      endDate = `${this.displayedMonths[1].year}-${this.padZero(this.displayedMonths[1].month + 1)}-30`;
    }
    
    console.log(`Date range: ${startDate} to ${endDate}`);
    
    // Prepare filter object
    const filters: ReportFilter = {
      reportType: this.filterForm.value.reportType,
      period: {
        start: startDate,
        end: endDate
      },
      location: this.filterForm.value.location
    };
    
    this.dashboardService.generateReport(filters).subscribe({
      next: (data) => {
        this.reportData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.isLoading = false;
      }
    });
  }

  toggleExportOptions(): void {
    this.showExportOptions = !this.showExportOptions;
    this.showReportTypeDropdown = false;
    this.showPeriodDropdown = false;
    this.showLocationDropdown = false;
  }

  exportReport(format: string): void {
    this.isLoading = true;
    this.dashboardService.exportReport(format, this.reportData).subscribe({
      next: () => {
        this.isLoading = false;
        this.showExportOptions = false;
        // In a real app, you would trigger the download here
        console.log(`Report exported in ${format} format`);
      },
      error: (error) => {
        console.error('Error exporting report:', error);
        this.isLoading = false;
      }
    });
  }

  // Helper method to get chunks of days for each week
  getWeeks(monthKey: string): any[][] {
    const days = this.calendarData[monthKey];
    if (!days) return [];
    
    const weeks = [];
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return weeks;
  }
  isDayBetweenSelectedDates(day: number, month: number, year: number): boolean {
    if (!this.selectedStartDate || !this.selectedEndDate) return false;
    
    const currentDate = new Date(year, month, day);
    const startDate = new Date(
      this.selectedStartDate.year, 
      this.selectedStartDate.month, 
      this.selectedStartDate.day
    );
    const endDate = new Date(
      this.selectedEndDate.year, 
      this.selectedEndDate.month, 
      this.selectedEndDate.day
    );
    
    // Ensure we return a boolean value
    return Boolean(currentDate > startDate && currentDate < endDate);
  }
}
