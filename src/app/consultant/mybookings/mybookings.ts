
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

interface SessionData {
  id: string;
  availableDate: string;
  availableTime: string;
  clientName: string;
  paymentStatus: string;
  // Add other fields as needed
}
@Component({
  selector: 'app-mybookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mybookings.html',
  styleUrl: './mybookings.css'
})
export class Mybookings implements OnInit {
  
  // sessions: any[] = [];
  sessions: SessionData[] = [];
  consultantEmail: string = '';
  consultantUid: string = '';

  constructor(private auth: Auth, private firestore: Firestore) {}

  // async ngOnInit() {
  //   const user = this.auth.currentUser;
  //   if (!user) return;

  //   this.consultantEmail = user.email || '';
  //   this.consultantUid = user.uid;

  //   const sessionsRef = collection(this.firestore, 'sessions');
  //   const q = query(sessionsRef, where('consultantUid', '==', this.consultantUid));
  //   const snapshot = await getDocs(q);

  //   // Map sessions and include doc ID (optional)
  //   this.sessions = snapshot.docs.map(doc => ({
  //     id: doc.id,
  //     ...doc.data()
  //   }));

  //   // Sort sessions by availableDate + availableTime
  //   this.sessions.sort((a, b) => {
  //     if (!a.availableDate || !a.availableTime) return 1;
  //     if (!b.availableDate || !b.availableTime) return -1;

  //     const dateA = new Date(`${a.availableDate}T${a.availableTime}`);
  //     const dateB = new Date(`${b.availableDate}T${b.availableTime}`);
  //     return dateA.getTime() - dateB.getTime();
  //   });
  // }
  async ngOnInit() {
  const user = this.auth.currentUser;
  if (!user) return;

  this.consultantUid = user.uid;

  const sessionsRef = collection(this.firestore, 'sessions');
  const q = query(sessionsRef, where('consultantUid', '==', this.consultantUid));
  const snapshot = await getDocs(q);

  const now = new Date();

  this.sessions = snapshot.docs
   .map(doc => doc.data() as SessionData)
  .filter(session => {
    const sessionDateTime = new Date(`${session.availableDate}T${session.availableTime}`);
    return sessionDateTime >= new Date();  // Keep only current & future
  })
  .sort((a, b) => {
    const dateA = new Date(`${a.availableDate}T${a.availableTime}`);
    const dateB = new Date(`${b.availableDate}T${b.availableTime}`);
    return dateA.getTime() - dateB.getTime();
  });
  }

}
