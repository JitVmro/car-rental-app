import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, catchError, tap } from 'rxjs/operators';
import { User } from '../../../models/User';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // API base URL - replace with your actual API URL
  private apiUrl = environment.apiUrl;
  // Token storage key
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {
    // Load user from localStorage on service initialization
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem(this.tokenKey);
    
    if (storedUser && storedToken) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/auth/sign-in`, credentials)
      .pipe(
        map(response => {
          console.log('Login response:', response); // Add detailed logging
          
          // Ensure role exists and normalize it
          const role = response.role ? response.role.toLowerCase() : 'client';
          
          // Extract user data and token from response
          const user: User = {
            id: response.userId,
            name: response.username || '',
            email: response.email,
            image: response.userImageUrl,
            role: role
          };
          
          console.log('Processed user:', user); // Log the processed user object
          
          // Store token and user in localStorage
          localStorage.setItem(this.tokenKey, response.idToken);
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          // Update the current user subject
          this.currentUserSubject.next(user);
          
          return user;
        }),
        catchError(this.handleError)
      );
  }

  register(userData: {
    name: string;
    surname?: string;
    email: string;
    password: string;
  }): Observable<User> {
    // Map frontend user data to API expected format
    const apiUserData = {
      firstName: userData.name,
      lastName: userData.surname || '',
      email: userData.email,
      password: userData.password
    };

    return this.http.post<any>(`${this.apiUrl}/auth/sign-up`, apiUserData)
      .pipe(
        map(response => {
          console.log('Registration response:', response);
          const user: User = {
            id: response.userId,
            name: userData.name,
            surname: userData.surname,
            email: userData.email,
            role: 'client', // Default role for new users
          };
          
          // If the API returns a token on registration
          if (response.token) {
            localStorage.setItem(this.tokenKey, response.token);
          }
          
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          
          return user;
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    // Remove user and token from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue && !!localStorage.getItem(this.tokenKey);
  }

  // Get the authentication token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Handle API errors
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = "This password isn't correct. Check it and try again.";
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    console.error('Auth error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}