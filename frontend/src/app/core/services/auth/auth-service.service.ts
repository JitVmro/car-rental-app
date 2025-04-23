import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../../../models/User';



@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private users: User[] = [
    { id: '1', name: 'Demo', email: 'dobrota@gmail.com',role:'client' },
  ];

  private userPasswords: Record<string, string> = {
    'dobrota@gmail.com': 'Password123',
  };

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    const user = this.users.find((u) => u.email === credentials.email);

    if (
      user &&
      this.userPasswords[credentials.email] === credentials.password
    ) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      console.log(this.users);

      return of(user).pipe(delay(800));
    }

    return throwError(
      () => new Error("This password isn't correct. Check it and try again.")
    );
  }

  register(userData: {
    name: string;
    surname?: string;
    email: string;
    password: string;
  }): Observable<User> {
    if (this.users.some((u) => u.email === userData.email)) {
      return throwError(() => new Error('Email already registered'));
    }

    const newUser: User = {
      id: (this.users.length + 1).toString(),
      name: userData.name,
      surname: userData.surname,
      email: userData.email,
      role: 'client',
    };

    this.users.push(newUser);
    this.userPasswords[userData.email] = userData.password;

    console.log(this.users);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    this.currentUserSubject.next(newUser);

    return of(newUser).pipe(delay(800));
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }
}
