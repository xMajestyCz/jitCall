import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/core/services/firestore.service';
import { UserService } from 'src/app/core/services/user.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Users } from 'src/app/models/users.models';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit, OnDestroy {
  contacts: Users[] = [];
  allContacts: Users[] = [];

  private userSub?: Subscription;
  

  constructor(
    private userService: UserService,
    private firestoreService: FirestoreService,
    private router: Router,
    private toastService: ToastService,
  ) {}

  ngOnInit() {
    this.userSub = this.userService.currentUser$
      .pipe(
        filter(u => u !== null),
        switchMap(u => this.firestoreService.getContactsWithProfiles(u!.id))
      )
      .subscribe({
        next: contacts => {
          this.contacts = contacts;
          this.allContacts = [...contacts];
        },
        error: err => {
          this.toastService.showToast('Error al cargar contactos', 'danger');
          console.error(err);
        }
      });
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
  }

  normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-\u036f]/g, '');
  }

  filterContacts(event: any) {
    const input = this.normalizeText(event.target.value || '');
    this.contacts = !input.trim()
      ? [...this.allContacts]
      : this.allContacts.filter(user => {
          const fullName = `${user.firstName} ${user.lastName}`;
          const reversed = `${user.lastName} ${user.firstName}`;
          const normalizedFull = this.normalizeText(fullName);
          const normalizedReversed = this.normalizeText(reversed);
          const normalizedPhone = this.normalizeText(user.phone);
          return (
            normalizedFull.includes(input) ||
            normalizedReversed.includes(input) ||
            normalizedPhone.includes(input)
          );
        });
  }

  goToToggle(route: string) {
    this.router.navigate([route]);
  }

  goToChat(contact: any) {
  this.router.navigate(['/chat'], {
    state: { contact }
  });
}
}
