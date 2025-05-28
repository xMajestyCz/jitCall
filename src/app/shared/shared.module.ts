import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SignInUpComponent } from './components/sign-in-up/sign-in-up.component';
import { HeaderComponent } from './components/header/header.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ImgContainerComponent } from './components/img-container/img-container.component';
import { FormFieldComponent } from './components/form-field/form-field.component';
import { FormatTimePipe } from './pipes/format-time.pipe';
import { LocationMapComponent } from './components/location-map/location-map.component';

@NgModule({
  declarations: [SignInUpComponent, HeaderComponent, ImgContainerComponent, FormFieldComponent, FormatTimePipe, LocationMapComponent],
  imports: [
    CommonModule, IonicModule, FormsModule, RouterModule, ReactiveFormsModule
  ],
  exports: [SignInUpComponent, HeaderComponent, ImgContainerComponent, FormFieldComponent, FormatTimePipe, LocationMapComponent],
})
export class SharedModule { }
