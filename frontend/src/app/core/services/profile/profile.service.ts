// profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/environment';


@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Helper method to get auth token from localStorage
  private getAuthToken(): string {
    const token = localStorage.getItem('auth_token');
    return token || '';
  }

  // Helper method to create headers with authorization
  private getAuthHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    console.log(token);
    return new HttpHeaders({
      // 'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getUserInfo(userId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/users/${userId}/personal-info`, { headers });
  }

  updateUserInfo(userId: string, userData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/users/${userId}/personal-info`, userData, { headers });
  }

  changePassword(userId: string, passwordData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/users/${userId}/change-password`, passwordData, { headers });
  }
}