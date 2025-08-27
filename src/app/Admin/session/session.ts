import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseDataService } from '../../services/firebase-data.service';

@Component({
  selector: 'app-session',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './session.html',
  styleUrl: './session.css'
})
export class Session implements OnInit {
  sessions: any[] = [];

  constructor(private firebaseData: FirebaseDataService) {}

  ngOnInit(): void {
    this.firebaseData.getSessions().subscribe((data) => {
      this.sessions = data;
    });
  }
}
