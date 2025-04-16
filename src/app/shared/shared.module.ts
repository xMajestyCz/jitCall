import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SignInUpComponent } from './sign-in-up/sign-in-up.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [SignInUpComponent],
  imports: [
    CommonModule, IonicModule, FormsModule, RouterModule
  ],
  exports: [SignInUpComponent],
})
export class SharedModule { }
