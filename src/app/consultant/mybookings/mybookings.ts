import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs, updateDoc, doc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

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
export class Mybookings implements OnInit, OnDestroy {
  sessions: SessionData[] = [];
  consultantUid: string = '';
  nearestSessionIndex: number = -1;
  countdown: number = 0;
  countdownInterval: any;

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {}

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (!user) return;

    this.consultantUid = user.uid;
    const sessionsRef = collection(this.firestore, 'sessions');
    const q = query(sessionsRef, where('consultantUid', '==', this.consultantUid));
    const snapshot = await getDocs(q);

    const now = new Date();
    const futureSessions: SessionData[] = [];

    for (const docSnap of snapshot.docs) {
      const session = docSnap.data() as SessionData;
      session.id = docSnap.id;

      const sessionDateTime = new Date(`${session.availableDate}T${session.availableTime}`);
      
      // Only include sessions that are still upcoming (future from current time)
      if (sessionDateTime.getTime() <= now.getTime()) continue;

      if (session.paymentStatus === 'success' && !session.meetLink) {
        session.meetLink = this.generateMeetLink(session);
        await updateDoc(doc(this.firestore, 'sessions', session.id), {
          meetLink: session.meetLink
        });
      }

      futureSessions.push(session);
    }

    // Sort upcoming sessions
    this.sessions = futureSessions.sort((a, b) => {
      const dateA = new Date(`${a.availableDate}T${a.availableTime}`);
      const dateB = new Date(`${b.availableDate}T${b.availableTime}`);
      return dateA.getTime() - dateB.getTime();
    });

    // Find the next upcoming one for countdown
    this.nearestSessionIndex = this.findNearestUpcomingSessionIndex();

    if (this.nearestSessionIndex !== -1) {
      const nearest = this.sessions[this.nearestSessionIndex];
      const target = new Date(`${nearest.availableDate}T${nearest.availableTime}`);
      this.startCountdown(target);
    }
  }

  ngOnDestroy() {
    this.clearCountdown();
  }

  generateMeetLink(session: SessionData): string {
    const base = 'https://meet.google.com/lookup/';
    const uniquePart = btoa(`${session.clientName}-${session.availableDate}-${session.availableTime}-${Math.random()}`).slice(0, 10);
    return `${base}${uniquePart}`;
  }

  findNearestUpcomingSessionIndex(): number {
    let minDiff = Infinity;
    let index = -1;
    const now = new Date();

    this.sessions.forEach((session, i) => {
      const sessionTime = new Date(`${session.availableDate}T${session.availableTime}`);
      const diff = sessionTime.getTime() - now.getTime();
      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        index = i;
      }
    });

    return index;
  }

  startCountdown(targetDate: Date) {
    this.clearCountdown();

    const update = () => {
      const now = new Date();
      const diff = Math.floor((targetDate.getTime() - now.getTime()) / 1000);
      this.countdown = diff > 0 ? diff : 0;

      if (this.countdown === 0) {
        this.clearCountdown();
      }
    };

    update();
    this.countdownInterval = setInterval(update, 1000);
  }

  clearCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  formatCountdown(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  startSession() {
  const sessionId = this.sessions[this.nearestSessionIndex].id;
  this.router.navigate(['/sessionchat', sessionId]);
}

}
