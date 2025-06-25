
import { Routes } from '@angular/router';

import { Home } from './pages/home/home';

import { Users } from './Admin/users/users';
import { Dashboard } from './Admin/dashboard/dashboard';
import { Consultants } from './Admin/consultants/consultants';
import { Payments } from './Admin/payments/payments';
import { Bookings } from './Admin/bookings/bookings';
import { Session } from './Admin/session/session';
import { AdminNavbar } from './components/admin.navbar/admin.navbar';
import { ClientDashboard } from './pages/clientdashboard/clientdashboard'
import { ConsultantProfile } from './pages/consultentprofile/consultentprofile';
import { AboutConsultant } from './pages/aboutconsultant/aboutconsultant';
import { ConsultentDashboard } from './pages/consultentdashboard/consultentdashboard';
// export const routes: Routes = [];

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  {
    path: 'pages',
    children: [
      { path: 'clientdashboard', component: ClientDashboard}
    ]
  },
    {
     path: 'register',
    loadComponent: () =>
     import('./auth/register/register').then((m) => m.Register),
  },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  // { path: 'admin/dashboard', component: Dashboard },
  {
    path: 'admin',
    component:AdminNavbar,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'users', component: Users },
      { path: 'consultants', component: Consultants },
      { path: 'payments', component: Payments },
      { path: 'bookings', component: Bookings},
      { path: 'session', component: Session},
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  { path: 'pages/consultentprofile', component: ConsultantProfile },
  { path: 'pages/aboutconsultant/:id', component: AboutConsultant },
  { path: 'pages/consultentdashboard', component: ConsultentDashboard }



];
