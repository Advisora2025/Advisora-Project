import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consultentprofile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultentprofile.html',
  styleUrls: ['./consultentprofile.css']
})
export class ConsultantProfile {
  constructor(private router: Router) {}

  consultants = [
    { id: 1, name: 'Dr. Aisha Rao', img: 'assets/aisha.jpg' },
    { id: 2, name: 'Dr. Rahul Verma', img: 'assets/rahul.jpg' },
    { id: 3, name: 'Dr. Meera Sen', img: 'assets/meera.jpg' },
    { id: 4, name: 'Dr. Arjun Das', img: 'assets/arjun.jpg' },
    { id: 5, name: 'Dr. Neha Sharma', img: 'assets/neha.jpg' },
    { id: 6, name: 'Dr. Karan Mehta', img: 'assets/karan.jpg' }
  ];

  viewAbout(id: number) {
    this.router.navigate(['/pages/aboutconsultant', id]);
  }
}
