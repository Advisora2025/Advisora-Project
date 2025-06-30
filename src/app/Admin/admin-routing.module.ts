
import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Consultants } from './consultants/consultants';
import { Payments } from './payments/payments';
import { Users } from './users/users';
import { EditProfile } from './edit-profile/edit-profile';
import { AdminGuard } from './admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard, canActivate: [AdminGuard]},
      { path: 'users', component: Users , canActivate: [AdminGuard]},
      { path: 'consultants', component: Consultants, canActivate: [AdminGuard]},
      { path: 'payments', component: Payments, canActivate: [AdminGuard] },
      { path: 'edit-profile', component: EditProfile, canActivate: [AdminGuard]}
  
    ]
  }
];
