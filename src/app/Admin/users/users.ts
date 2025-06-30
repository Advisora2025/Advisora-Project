import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FirebaseDataService } from '../../services/firebase-data.service';



@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
  
})
export class Users implements OnInit {
  users: any[] = [];
  
  constructor(private firebaseData: FirebaseDataService) {}
  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.firebaseData.getClients().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        console.error('Error loading clients:', err);
        // Handle error (e.g., show error message)
      }
    });
  }

 

}
