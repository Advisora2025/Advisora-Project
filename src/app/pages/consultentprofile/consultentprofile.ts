import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseDataService } from '../../services/firebase-data.service'; // adjust path as needed

@Component({
  selector: 'app-consultentprofile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultentprofile.html',
  styleUrls: ['./consultentprofile.css']
})
export class ConsultantProfile implements OnInit {
  consultants: any[] = [];

  constructor(
    private router: Router,
    private firebaseData: FirebaseDataService
  ) {}

  ngOnInit(): void {
    this.firebaseData.getAcceptedConsultants().subscribe(data => {
      this.consultants = data;
    });
  }

  viewAbout(id: string) {
    this.router.navigate(['/pages/aboutconsultant', id]);
  }
}
