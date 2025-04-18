import { Component, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { Users } from 'src/app/models/users.models';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { ToastService } from 'src/app/core/services/toast.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit {
  contacts: Users[] = [];
  allContacts: Users[] = [];

  constructor(
    private firestoreService: FirestoreService,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadContacts();
  }

  async loadContacts() {
    try {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser && currentUser.uid) {
        this.firestoreService.getContacts(currentUser.uid).subscribe((contacts) => {
          this.contacts = contacts;
          this.allContacts = contacts;
        });
      } else {
        this.toastService.showToast('No se pudo obtener el usuario autenticado ❌', 2500, 'danger');
      }
    } catch (error) {
      this.toastService.showToast('Hubo un error al cargar los contactos ❌', 2500, 'danger');
    }
  }
  
  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
  
  filterContacts(event: any) {
    const input = this.normalizeText(event.target.value || '');
  
    if (!input.trim()) {
      this.contacts = this.allContacts;
      return;
    }
  
    this.contacts = this.allContacts.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`;
      const reversedFullName = `${user.lastName} ${user.firstName}`;
      const phone = user.phone;
  
      const normalizedFullName = this.normalizeText(fullName);
      const normalizedReversed = this.normalizeText(reversedFullName);
      const normalizedPhone = this.normalizeText(phone);
  
      return (
        normalizedFullName.includes(input) ||
        normalizedReversed.includes(input) ||
        normalizedPhone.includes(input)
      );
    });
  }  

  goToToggle() {
    this.router.navigate(['/add']);
  }
}
