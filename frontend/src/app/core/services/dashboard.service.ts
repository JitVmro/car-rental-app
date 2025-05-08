import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { environment } from '../../../environment/environment';
import { ReportData, ReportFilter } from '../../models/report.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = environment.apiUrl;
  
  // Mock data storage
  private mockReportData: { [key: string]: ReportData[] } = {};

  constructor(private http: HttpClient) {
    // Initialize mock data
    this.generateMockData();
  }

  private generateMockData(): void {
    // Generate mock data for different locations and report types
    const locations = ['Rome', 'Milan', 'Florence', 'Naples', 'Venice'];
    const carModels = [
      { model: 'Nissan Juke', idPrefix: 'BC' },
      { model: 'Fiat Ageia', idPrefix: 'KE' },
      { model: 'Toyota Prius', idPrefix: 'TL' },
      { model: 'Volkswagen Golf', idPrefix: 'VW' },
      { model: 'Ford Focus', idPrefix: 'FD' },
      { model: 'Renault Clio', idPrefix: 'RC' },
      { model: 'Mercedes A-Class', idPrefix: 'MB' },
      { model: 'BMW 1 Series', idPrefix: 'BM' },
      { model: 'Audi A3', idPrefix: 'AU' },
      { model: 'Hyundai i30', idPrefix: 'HY' }
    ];

    // Generate data for each location and report type
    locations.forEach(location => {
      // Create data for sales report
      const salesReportData: ReportData[] = [];
      
      // Generate 5-10 entries per location
      const numEntries = 5 + Math.floor(Math.random() * 6); // 5-10 entries
      
      for (let i = 0; i < numEntries; i++) {
        const carModelIndex = Math.floor(Math.random() * carModels.length);
        const car = carModels[carModelIndex];
        
        // Generate random ID
        const randomId = Math.floor(10000 + Math.random() * 90000);
        const carId = `${car.idPrefix}-${randomId}`;
        
        // Generate random metrics
        const daysOfRent = 2 + Math.floor(Math.random() * 7); // 2-8 days
        const reservations = 1 + Math.floor(Math.random() * 4); // 1-4 reservations
        const mileageAtBeginning = 1000 + Math.floor(Math.random() * 3000);
        const totalMileage = 200 + Math.floor(Math.random() * 800);
        const mileageAtEnd = mileageAtBeginning + totalMileage;
        const averageMileage = Math.round(totalMileage / daysOfRent);
        
        // Generate random deltas
        const deltaOptions = ['+', '-'];
        const deltaDirection = deltaOptions[Math.floor(Math.random() * 2)];
        const deltaPercentage = 3 + Math.floor(Math.random() * 18); // 3-20%
        const deltaOfAvgMileage = `${deltaDirection}${deltaPercentage}%`;
        
        // Generate random feedback
        const averageFeedback = 3 + (Math.random() * 2); // 3.0-5.0
        const minimumFeedback = Math.max(3, Math.floor(averageFeedback));
        const deltaFeedbackDirection = deltaOptions[Math.floor(Math.random() * 2)];
        const deltaFeedbackPercentage = 3 + Math.floor(Math.random() * 18);
        const deltaOfFeedback = `${deltaFeedbackDirection}${deltaFeedbackPercentage}%`;
        
        // Generate random revenue
        const revenueBase = 100 * daysOfRent;
        const revenue = revenueBase + Math.floor(Math.random() * 300);
        const deltaRevenueDirection = deltaOptions[Math.floor(Math.random() * 2)];
        const deltaRevenuePercentage = 1 + Math.floor(Math.random() * 15);
        const deltaOfRevenue = `${deltaRevenueDirection}${deltaRevenuePercentage}%`;
        
        // Create sales report data entry
        const salesReportEntry: ReportData = {
          periodStart: '15.01.2025',
          periodEnd: '22.01.2025',
          location: location,
          carModel: car.model,
          carId: carId,
          daysOfRent: daysOfRent,
          reservations: reservations,
          mileageAtBeginning: mileageAtBeginning,
          mileageAtEnd: mileageAtEnd,
          totalMileage: totalMileage,
          averageMileage: averageMileage,
          deltaOfAvgMileage: deltaOfAvgMileage,
          averageFeedback: parseFloat(averageFeedback.toFixed(1)),
          minimumFeedback: minimumFeedback,
          deltaOfFeedback: deltaOfFeedback,
          revenue: revenue,
          deltaOfRevenue: deltaOfRevenue,
        };
        
        // Add to sales report data
        salesReportData.push(salesReportEntry);
      }
      
      // Store the sales report data
      this.mockReportData[`Sales report-${location}`] = salesReportData;
      
      // Create data for staff performance report (with slightly different metrics)
      const staffReportData: ReportData[] = [];
      
      for (let i = 0; i < numEntries; i++) {
        const carModelIndex = Math.floor(Math.random() * carModels.length);
        const car = carModels[carModelIndex];
        
        // Generate random ID
        const randomId = Math.floor(10000 + Math.random() * 90000);
        const carId = `${car.idPrefix}-${randomId}`;
        
        // Generate random metrics
        const daysOfRent = 2 + Math.floor(Math.random() * 7); // 2-8 days
        const reservations = 1 + Math.floor(Math.random() * 4); // 1-4 reservations
        const mileageAtBeginning = 1000 + Math.floor(Math.random() * 3000);
        const totalMileage = 200 + Math.floor(Math.random() * 800);
        const mileageAtEnd = mileageAtBeginning + totalMileage;
        const averageMileage = Math.round(totalMileage / daysOfRent);
        
        // Generate random deltas
        const deltaOptions = ['+', '-'];
        const deltaDirection = deltaOptions[Math.floor(Math.random() * 2)];
        const deltaPercentage = 3 + Math.floor(Math.random() * 18); // 3-20%
        const deltaOfAvgMileage = `${deltaDirection}${deltaPercentage}%`;
        
        // Generate random feedback (slightly lower for staff performance)
        const averageFeedback = 2.5 + (Math.random() * 2.5); // 2.5-5.0
        const minimumFeedback = Math.max(2, Math.floor(averageFeedback));
        const deltaFeedbackDirection = deltaOptions[Math.floor(Math.random() * 2)];
        const deltaFeedbackPercentage = 3 + Math.floor(Math.random() * 18);
        const deltaOfFeedback = `${deltaFeedbackDirection}${deltaFeedbackPercentage}%`;
        
        // Generate random revenue (slightly lower for staff performance)
        const revenueBase = 80 * daysOfRent;
        const revenue = revenueBase + Math.floor(Math.random() * 250);
        const deltaRevenueDirection = deltaOptions[Math.floor(Math.random() * 2)];
        const deltaRevenuePercentage = 1 + Math.floor(Math.random() * 15);
        const deltaOfRevenue = `${deltaRevenueDirection}${deltaRevenuePercentage}%`;
        
        // Create staff report data entry
        const staffReportEntry: ReportData = {
          periodStart: '15.01.2025',
          periodEnd: '22.01.2025',
          location: location,
          carModel: car.model,
          carId: carId,
          daysOfRent: daysOfRent,
          reservations: reservations,
          mileageAtBeginning: mileageAtBeginning,
          mileageAtEnd: mileageAtEnd,
          totalMileage: totalMileage,
          averageMileage: averageMileage,
          deltaOfAvgMileage: deltaOfAvgMileage,
          averageFeedback: parseFloat(averageFeedback.toFixed(1)),
          minimumFeedback: minimumFeedback,
          deltaOfFeedback: deltaOfFeedback,
          revenue: revenue,
          deltaOfRevenue: deltaOfRevenue,
        };
        
        // Add to staff report data
        staffReportData.push(staffReportEntry);
      }
      
      // Store the staff report data
      this.mockReportData[`Staff performance-${location}`] = staffReportData;
    });
  }

  getReportTypes(): Observable<string[]> {
    // In a real app, this would come from the API
    return of(['Sales report', 'Staff performance']);
  }

  getLocations(): Observable<string[]> {
    // In a real app, this would come from the API
    return of(['Rome', 'Milan', 'Florence', 'Naples', 'Venice']);
  }

  generateReport(filters: ReportFilter): Observable<ReportData[]> {
    console.log('Generating report with filters:', filters);
    
    // Create a key to look up the mock data
    const dataKey = `${filters.reportType}-${filters.location}`;
    
    // Get the data for this key, or return empty array if not found
    let data = this.mockReportData[dataKey] || [];
    
    // If date filtering is requested, filter the data without modifying it
    if (filters.period && filters.period.start && filters.period.end) {
      const startDate = new Date(filters.period.start);
      const endDate = new Date(filters.period.end);
      
      // For demo purposes, we'll just check if the selected date range overlaps with our mock data
      // In a real app, you would filter based on actual date values in the data
      
      // Since our mock data has fixed dates (15.01.2025 - 22.01.2025), we'll check if the selected range overlaps
      const mockStartDate = new Date(2025, 0, 15); // January 15, 2025
      const mockEndDate = new Date(2025, 0, 22);   // January 22, 2025
      
      // Check if there's no overlap between the selected range and mock data range
      if (endDate < mockStartDate || startDate > mockEndDate) {
        // No overlap, return empty array
        console.log('Selected date range does not match available data');
        data = [];
      }
      
      // If there is overlap, we keep the data as is (no modification)
    }
    
    console.log(`Found ${data.length} records for ${dataKey}`);
    
    // Add a delay to simulate network request
    return of(data).pipe(
      delay(800), // 800ms delay to show loading state
      catchError((error) => {
        console.error('Error fetching report data:', error);
        return of([]);
      })
    );
  }
  
  
  
  // Helper method to format dates as DD.MM.YYYY
  private formatDateForDisplay(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
  exportReport(format: string, data: ReportData[]): Observable<boolean> {
    // In a real app, this would call an API endpoint to generate the export
    // For now, we'll simulate a successful export with a delay
    console.log(`Exporting report in ${format} format with ${data.length} records`);
    
    // Different delays for different formats to simulate real-world behavior
    const delayTime = format === 'pdf' ? 1200 : format === 'xls' ? 800 : 500;
    
    return of(true).pipe(delay(delayTime));
  }
}