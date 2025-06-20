import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
// import { Dashboard } from './Admin/dashboard/dashboard';
import { adminRoutes } from './Admin/admin-routing.module';
import { Users } from './Admin/users/users';
import { Dashboard } from './Admin/dashboard/dashboard';
import { Consultants } from './Admin/consultants/consultants';
import { Payments } from './Admin/payments/payments';
import { Bookings } from './Admin/bookings/bookings';
import { Session } from './Admin/session/session';
// export const routes: Routes = [];

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
   {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register').then((m) => m.Register),
  },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  // { path: 'admin/dashboard', component: Dashboard },
  {
    path: 'admin',
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'users', component: Users },
      { path: 'consultants', component: Consultants },
      { path: 'payments', component: Payments },
      { path: 'bookings', component: Bookings},
      { path: 'session', component: Session}
    ]
  },
  { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' }
  // other routes...
];
