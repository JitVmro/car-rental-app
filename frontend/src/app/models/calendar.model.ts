
export interface CalendarDate {
    date: Date;
    isSelected?: boolean;
    isDisabled?: boolean;
    isGrayed?: boolean;
    isToday?: boolean;
}

export interface CalendarMonth {
    year: number;
    month: number;
    dates: CalendarDate[];
}