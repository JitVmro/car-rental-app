// documents.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents.component.html'
})
export class DocumentsComponent {
  @Input() userId: string = '';
  
  passportFront: boolean = true;
  passportBack: boolean = true;
  licenseFront: boolean = true;
  licenseBack: boolean = true;
  
  showSuccessMessage: boolean = false;
  showDeleteModal: boolean = false;
  documentToDelete: string | null = null;

  simulateFileUpload(documentType: string): void {
    // In a real app, this would trigger a file upload dialog
    // For demo purposes, we'll just set the document as uploaded
    switch(documentType) {
      case 'passportFront':
        this.passportFront = true;
        break;
      case 'passportBack':
        this.passportBack = true;
        break;
      case 'licenseFront':
        this.licenseFront = true;
        break;
      case 'licenseBack':
        this.licenseBack = true;
        break;
    }
  }

  removeDocument(documentType: string): void {
    this.documentToDelete = documentType;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.documentToDelete) {
      switch(this.documentToDelete) {
        case 'passportFront':
          this.passportFront = false;
          break;
        case 'passportBack':
          this.passportBack = false;
          break;
        case 'licenseFront':
          this.licenseFront = false;
          break;
        case 'licenseBack':
          this.licenseBack = false;
          break;
      }
      this.documentToDelete = null;
      this.showDeleteModal = false;
    }
  }

  cancelDelete(): void {
    this.documentToDelete = null;
    this.showDeleteModal = false;
  }

  saveChanges(): void {
    // In a real app, this would send the documents to the server
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 5000);
  }
}