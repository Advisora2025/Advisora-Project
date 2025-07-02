import { Routes } from '@angular/router';
import { Consultantdashboard } from './consultantdashboard/consultantdashboard'; 
import { Session } from './session/session';

import { ConsultantPayment } from './consultant.payment/consultant.payment';
import { Mybookings } from './mybookings/mybookings';

export const consultantRoutes: Routes = [
  {
    path: '',
        children: [
          { path: '', redirectTo: 'consultantdashboard', pathMatch: 'full' },
          { path: 'consultantdashboard', component: Consultantdashboard},
          { path: 'session', component: Session},
          { path: 'myBookings', component: Mybookings },
          { path: 'consultantPayment', component: ConsultantPayment},
        ]
          
  },

];
