import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SignInUpComponent } from './components/sign-in-up/sign-in-up.component';
import { HeaderComponent } from './components/header/header.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [SignInUpComponent, HeaderComponent],
  imports: [
    CommonModule, IonicModule, FormsModule, RouterModule, ReactiveFormsModule
  ],
  exports: [SignInUpComponent, HeaderComponent],
})
export class SharedModule { }
