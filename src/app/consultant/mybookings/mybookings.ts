import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';


@Component({
  selector: 'app-mybookings', 
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mybookings.html',
  styleUrl: './mybookings.css'
})
export class Mybookings implements OnInit {
  sessions: any[] = [];
  consultantEmail: string = '';
  consultantUid: string = '';

  constructor(private auth: Auth, private firestore: Firestore) {}

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (!user) return;

    this.consultantEmail = user.email || '';
    this.consultantUid = user.uid;

    const sessionsRef = collection(this.firestore, 'sessions');

    const q = query(
      sessionsRef,
      where('consultantUid', '==', this.consultantUid)
    );

    const snapshot = await getDocs(q);
    this.sessions = snapshot.docs.map(doc => doc.data());
  }
}
