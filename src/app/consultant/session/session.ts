import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc, query, where } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session.html',
  styleUrl: './session.css'
})
export class Session implements OnInit {
  sessions$: Observable<any[]> | undefined;
  consultantUid: string | null = null;

  constructor(private firestore: Firestore, private auth: Auth) {}

  ngOnInit(): void {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.consultantUid = user.uid;
        const sessionRef = collection(this.firestore, 'sessions');

        // Fetch only pending sessions for the logged-in consultant
        const pendingSessionsQuery = query(
          sessionRef,
          where('consultantUid', '==', this.consultantUid),
          where('confirmation', '==', 'pending')
        );

        this.sessions$ = collectionData(pendingSessionsQuery, { idField: 'id' });
      }
    });
  }

  updateConfirmation(sessionId: string, status: 'accepted' | 'rejected') {
    const sessionDoc = doc(this.firestore, `sessions/${sessionId}`);
    updateDoc(sessionDoc, { confirmation: status });
  }
}
