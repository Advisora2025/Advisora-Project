import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';

interface SessionData {
  id: string;
  availableDate: string;
  availableTime: string;
  clientName: string;
  paymentStatus: string;
  meetLink?: string;
}

@Component({
  selector: 'app-mybookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mybookings.html',
  styleUrl: './mybookings.css'
})
export class Mybookings implements OnInit {
  sessions: SessionData[] = [];
  consultantUid: string = '';

  constructor(private auth: Auth, private firestore: Firestore) {}

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (!user) return;

    this.consultantUid = user.uid;
    const sessionsRef = collection(this.firestore, 'sessions');
    const q = query(sessionsRef, where('consultantUid', '==', this.consultantUid));
    const snapshot = await getDocs(q);

    const now = new Date();

    const updatedSessions: SessionData[] = [];

    for (const docSnap of snapshot.docs) {
      const session = docSnap.data() as SessionData;
      session.id = docSnap.id;

      const sessionDateTime = new Date(`${session.availableDate}T${session.availableTime}`);
      if (sessionDateTime < now) continue;

      // If paid but no meetLink, generate and update
      if (session.paymentStatus === 'Paid' && !session.meetLink) {
        session.meetLink = this.generateMeetLink(session);
        const sessionDocRef = doc(this.firestore, 'sessions', session.id);
        await updateDoc(sessionDocRef, { meetLink: session.meetLink });
      }

      updatedSessions.push(session);
    }

    this.sessions = updatedSessions.sort((a, b) => {
      const dateA = new Date(`${a.availableDate}T${a.availableTime}`);
      const dateB = new Date(`${b.availableDate}T${b.availableTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  }

  generateMeetLink(session: SessionData): string {
    const base = 'https://meet.google.com/lookup/';
    const uniquePart = btoa(`${session.clientName}-${session.availableDate}-${session.availableTime}-${Math.random()}`).slice(0, 10);
    return `${base}${uniquePart}`;
  }
}
