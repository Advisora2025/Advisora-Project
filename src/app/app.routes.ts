import { Routes } from '@angular/router';

const newLocal = './Admin/Admin.module';
import { Home } from './pages/home/home';
// export const routes: Routes = [];

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  // other routes...
];
