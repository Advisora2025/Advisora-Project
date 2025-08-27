import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clientdashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientdashboard.html',
  styleUrls: ['./clientdashboard.css']
})
export class ClientDashboard {
  constructor(private router: Router) {}

  goToConsultants() {
    this.router.navigate(['/pages/consultentprofile']);
  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // ✅ Remove leftover overlays that block clicks
        document.querySelectorAll('.modal-backdrop, .show')
          .forEach(e => e.remove());
      }
    });
  
  }
}
