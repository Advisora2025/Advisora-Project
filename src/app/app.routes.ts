  import { Routes } from '@angular/router';

  import { Home } from './pages/home/home';


  import { AdminNavbar } from './components/admin.navbar/admin.navbar';
  import { ClientDashboard } from './pages/clientdashboard/clientdashboard'
  import { ConsultentProfile } from './pages/consultentprofile/consultentprofile';
  import { AboutConsultant } from './pages/aboutconsultant/aboutconsultant';

  
import { AdminGuard } from './Admin/admin.guard';

import { ConsultantSidebar } from './components/consultant-sidebar/consultant-sidebar';
import { ClientSession } from './pages/client.session/client.session';
import { Sessionchat } from './pages/sessionchat/sessionchat';
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
    { path: 'auth', loadChildren: () => import('./auth/auth-routing-module').then(m => m.AuthRoutingModule) },
    // { path: 'admin/dashboard', component: Dashboard },
    
    {
      path: 'admin',
      component:AdminNavbar,
       canActivate: [AdminGuard],
       loadChildren: () => import('./Admin/admin-routing.module').then(m => m.adminRoutes)
      
    },
    // { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' },
    { path: 'pages/consultentprofile', component: ConsultentProfile },
    { path: 'pages/aboutconsultant/:id', component: AboutConsultant },
    { path: 'pages/clientsesssion/:id', component: ClientSession },
    {
  path: 'sessionchat/:sessionId',
  component: Sessionchat
},

    
    { 
      path: 'consultant', 
      component: ConsultantSidebar,
      loadChildren: () =>  import('./consultant/consultant-routing.module').then((m) => m.consultantRoutes),}



  ];