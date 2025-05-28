import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { Users } from 'src/app/models/users.models';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<Users | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService
  ) {
    this.init();
  }

  private async init() {
    this.authService.user$.subscribe(async (authUser) => {
      if (authUser) {
        await this.loadUserData(authUser.uid);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async loadUserData(userId: string): Promise<void> {
    try {
      const userDoc = await this.firestoreService.getUserDocument(userId);
      
      if (userDoc) {
        const userData: Users = {
          id: userId,
          firstName: userDoc['firstName'] || '',
          lastName: userDoc['lastName'] || '',
          phone: userDoc['phone'] || '',
          profileImage: userDoc['profileImage'] || '',
          token: userDoc['token'] || ''
        };
        this.currentUserSubject.next(userData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.currentUserSubject.next(null);
    }
  }

  getCurrentUser(): Users | null {
    return this.currentUserSubject.value;
  }

  async refreshUserData(): Promise<void> {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      await this.loadUserData(currentUser.id);
    }
  }
}