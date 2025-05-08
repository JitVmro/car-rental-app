export interface ReportFilter {
    reportType: string;
    period: {
      start: string;
      end: string;
    };
    location: string;
  }
  
  export interface ReportData {
    periodStart: string;
    periodEnd: string;
    location: string;
    carModel: string;
    carId: string;
    daysOfRent: number;
    reservations: number;
    mileageAtBeginning: number;
    mileageAtEnd: number;
    totalMileage: number;
    averageMileage: number;
    deltaOfAvgMileage: string;
    averageFeedback: number;
    minimumFeedback: number;
    deltaOfFeedback: string;
    revenue: number;
    deltaOfRevenue: string;
  }

  interface CalendarDate {
    day: number;
    month: number;
    year: number;
  }