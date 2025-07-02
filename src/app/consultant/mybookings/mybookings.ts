import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mybookings', 
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mybookings.html',
  styleUrl: './mybookings.css'
})
export class Mybookings implements OnInit {
  bookings$: Observable<any[]> | undefined;
  consultantUid: string | null = null;

  constructor(private firestore: Firestore, private auth: Auth) {}

  ngOnInit(): void {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.consultantUid = user.uid;

        const sessionRef = collection(this.firestore, 'sessions');
        const acceptedBookingsQuery = query(
          sessionRef,
          where('consultantUid', '==', this.consultantUid),
          where('confirmation', '==', 'accepted')
        );

        this.bookings$ = collectionData(acceptedBookingsQuery, { idField: 'id' });
      }
    });
  }

}
