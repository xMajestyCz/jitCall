import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChangePicNamePage } from './change-pic-name.page';

const routes: Routes = [
  {
    path: '',
    component: ChangePicNamePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChangePicNamePageRoutingModule {}
