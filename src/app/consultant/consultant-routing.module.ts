import { Routes } from '@angular/router';
import { Consultantdashboard } from './consultantdashboard/consultantdashboard'; 
import { Session } from './session/session';
export const consultantRoutes: Routes = [
  {
    path: '',
        children: [
          { path: '', redirectTo: 'consultantdashboard', pathMatch: 'full' },
          { path: 'consultantdashboard', component: Consultantdashboard},
          { path: 'session', component: Session},
        ]
          
  },

];
