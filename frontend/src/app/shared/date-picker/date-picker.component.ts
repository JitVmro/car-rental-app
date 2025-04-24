import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true, // Add this
  imports: [CommonModule, FormsModule], // Add this
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css']
})
export class DatePickerComponent implements OnInit {
  @Output() dateRangeSelected = new EventEmitter<{ startDate: Date, endDate: Date }>();

  months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  currentMonth: Date = new Date();
  nextMonth: Date = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);

  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;

  calendar1: Date[][] = [];
  calendar2: Date[][] = [];

  pickupTime: string = '07:00 AM';
  dropoffTime: string = '10:30 AM';

  ngOnInit(): void {
    this.generateCalendars();
  }

  generateCalendars(): void {
    this.calendar1 = this.generateMonthCalendar(this.currentMonth);
    this.calendar2 = this.generateMonthCalendar(this.nextMonth);
  }

  generateMonthCalendar(month: Date): Date[][] {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    let days: Date[] = [];

    let firstDayWeekDay = firstDay.getDay() || 7;
    for (let i = firstDayWeekDay - 1; i > 0; i--) {
      const date = new Date(firstDay);
      date.setDate(date.getDate() - i);
      days.push(date);
    }

    for (let date = new Date(firstDay); date <= lastDay; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(lastDay);
      date.setDate(date.getDate() + i);
      days.push(date);
    }

    let weeks: Date[][] = [];
    while (days.length) {
      weeks.push(days.splice(0, 7));
    }

    return weeks;
  }

  selectDate(date: Date): void {
    if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate)) {
      this.selectedStartDate = date;
      this.selectedEndDate = null;
    } else {
      if (date < this.selectedStartDate) {
        this.selectedEndDate = this.selectedStartDate;
        this.selectedStartDate = date;
      } else {
        this.selectedEndDate = date;
      }
      this.dateRangeSelected.emit({
        startDate: this.selectedStartDate,
        endDate: this.selectedEndDate!
      });
    }
  }

  isSelected(date: Date): boolean {
    if (!this.selectedStartDate) return false;

    const isStart = this.isSameDate(date, this.selectedStartDate);
    const isEnd = this.selectedEndDate ? this.isSameDate(date, this.selectedEndDate) : false;
    const isInRange = this.selectedEndDate ?
      (date > this.selectedStartDate && date < this.selectedEndDate) :
      false;

    return isStart || isEnd || isInRange;
  }

  isStartDate(date: Date): boolean {
    if (!this.selectedStartDate) return false;
    return this.isSameDate(date, this.selectedStartDate);
  }

  isEndDate(date: Date): boolean {
    if (!this.selectedEndDate) return false;
    return this.isSameDate(date, this.selectedEndDate);
  }

  isSameDate(date1: Date, date2: Date | null): boolean {
    if (!date2) return false;
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }

  isInCurrentMonth(date: Date, monthDate: Date): boolean {
    return date.getMonth() === monthDate.getMonth();
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.nextMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendars();
  }

  goToNextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.nextMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendars();
  }
}