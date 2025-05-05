export interface bookingFeedback {
    bookingId: string;
    clientId: string;
    carId: string;
    rating: number;
    feedbackText: string;

    
    date?: Date;
    feedbackId?: string;
    
}