
  import { Routes } from '@angular/router';

  import { Home } from './pages/home/home';


  import { AdminNavbar } from './components/admin.navbar/admin.navbar';
  import { ClientDashboard } from './pages/clientdashboard/clientdashboard'
  import { ConsultantProfile } from './pages/consultentprofile/consultentprofile';
  import { AboutConsultant } from './pages/aboutconsultant/aboutconsultant';
  import {ConsultentDashboard  } from './pages/consultentdashboard/consultentdashboard';

  import { EditProfile } from './Admin/edit-profile/edit-profile';
import { AdminGuard } from './Admin/admin.guard';
import { Consultantdashboard } from './consultant/consultantdashboard/consultantdashboard';
import { ConsultantSidebar } from './components/consultant-sidebar/consultant-sidebar';
  // export const routes: Routes = [];

  export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: Home },
    {
      path: 'pages',
      children: [
        { path: 'clientdashboard', component: ClientDashboard }
        
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
       canActivate: [AdminGuard],
       loadChildren: () => import('./Admin/admin-routing.module').then(m => m.adminRoutes)
      
    },
    { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' },
    { path: 'pages/consultentprofile', component: ConsultantProfile },
    { path: 'pages/aboutconsultant/:id', component: AboutConsultant },
    
    { 
      path: 'consultant', 
      component: ConsultantSidebar,
      loadChildren: () =>  import('./consultant/consultant-routing.module').then((m) => m.consultantRoutes),}



  ];
