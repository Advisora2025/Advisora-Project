import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin.navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './admin.navbar.html',
  styleUrl: './admin.navbar.css'
})
export class AdminNavbar {
  constructor(private router: Router) {} 

  logout() {    
      this.router.navigate(['/home']);
   
  }

}
