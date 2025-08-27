import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, RouterLink, Router } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  
})
export class Dashboard implements OnInit{
constructor(private router: Router) {}
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
