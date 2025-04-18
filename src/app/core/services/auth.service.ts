import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';
import { Users } from 'src/app/models/users.models';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = new BehaviorSubject<any | null>(null);
  user$ = this.currentUser.asObservable();

  constructor(private auth: Auth, private firestore: Firestore) {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.next(user);
    });
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  getCurrentUser() {
    return this.currentUser.value;
  }

  async getCurrentUserPhone(): Promise<string | null> {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const userDoc = await getDoc(doc(this.firestore, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as Users; 
        return userData.phone || null;
      }
    }
    return null;
  }

  logout() {
    return this.auth.signOut();
  }

  isLoggedIn(): boolean {
    return this.currentUser.value !== null;
  }
}