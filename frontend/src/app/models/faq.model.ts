export interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

export interface FaqApiResponse {
  faqs: {
    question: string;
    answer: string;
  }[];
}