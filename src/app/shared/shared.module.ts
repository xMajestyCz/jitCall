import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SignInUpComponent } from './components/sign-in-up/sign-in-up.component';
import { HeaderComponent } from './components/header/header.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { IncomingCallModalComponent } from './components/incoming-call-modal/incoming-call-modal.component';

@NgModule({
  declarations: [SignInUpComponent, HeaderComponent, IncomingCallModalComponent],
  imports: [
    CommonModule, IonicModule, FormsModule, RouterModule, ReactiveFormsModule
  ],
  exports: [SignInUpComponent, HeaderComponent, IncomingCallModalComponent],
})
export class SharedModule { }
