import { Component } from '@angular/core';
import { Router } from '@angular/router';
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

  ngOnInit() {
  console.log('ClientDashboard Loaded');
}

}
