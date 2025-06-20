// app/auth/auth-routing-module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register';
import { Login} from './login/login';

const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: Login }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
