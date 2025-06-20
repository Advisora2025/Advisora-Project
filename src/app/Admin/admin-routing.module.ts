
import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Consultants } from './consultants/consultants';
import { Payments } from './payments/payments';
import { Users } from './users/users';

export const adminRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'users', component: Users },
      { path: 'consultants', component: Consultants},
      { path: 'payments', component: Payments },
    ]
  }
];
