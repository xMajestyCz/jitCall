import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'log-in',
    loadChildren: () => import('./pages/log-in/log-in.module').then( m => m.LogInPageModule)
  },
  {
    path: '',
    redirectTo: 'log-in',
    pathMatch: 'full'
  },
  {
    path: 'log',
    loadChildren: () => import('./pages/log/log.module').then( m => m.LogPageModule)
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'add',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/add/add.module').then( m => m.AddPageModule)
  },
  {
    path: 'incoming-call',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/incoming-call/incoming-call.module').then( m => m.IncomingCallPageModule)
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/account/account.module').then( m => m.AccountPageModule)
  },
  {
    path: 'change-pic-name',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/change-pic-name/change-pic-name.module').then( m => m.ChangePicNamePageModule)
  },
  {
    path: 'chat',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/chat/chat.module').then( m => m.ChatPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
