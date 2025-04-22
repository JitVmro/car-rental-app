import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaqService } from '../../core/services/faq.service';
import { FAQ } from '../../models/faq.model';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {
  faqs: FAQ[] = [];
  
  constructor(private faqService: FaqService) {}
  
  ngOnInit(): void {
    this.faqService.getFaqs().subscribe(faqs => {
      this.faqs = faqs;
    });
  }
  
  toggleFaq(index: number): void {
    this.faqService.toggleFaq(index);
  }
}