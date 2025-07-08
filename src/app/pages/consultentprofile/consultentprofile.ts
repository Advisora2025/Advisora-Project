import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

declare var bootstrap: any; // Required for Bootstrap Modal

@Component({
  selector: 'app-consultentprofile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultentprofile.html',
  styleUrls: ['./consultentprofile.css']
})
export class ConsultentProfile implements OnInit {
  consultants: any[] = [];
  sessions: any[] = [];

  constructor(
    private router: Router,
    private firestore: Firestore,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.loadConsultants();
  }

  loadConsultants() {
    const colRef = collection(this.firestore, 'consultants');
    getDocs(colRef).then(snapshot => {
      this.consultants = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });
  }

  async openSessionModal() {
    const user = this.auth.currentUser;
    if (!user) return;

    const q = query(
      collection(this.firestore, 'sessions'),
      where('clientUid', '==', user.uid)
    );
    const querySnapshot = await getDocs(q);
    const unsortedSessions = querySnapshot.docs.map(doc => doc.data());

    // Sort by availableDate and availableTime (newest first)
    this.sessions = unsortedSessions.sort((a: any, b: any) => {
      const dateTimeA = new Date(`${a.availableDate} ${a.availableTime}`);
      const dateTimeB = new Date(`${b.availableDate} ${b.availableTime}`);
      return dateTimeB.getTime() - dateTimeA.getTime(); // descending order
    });

    const modalElement = document.getElementById('sessionModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigate(['home']);
    });
  }

  viewAbout(id: string) {
    this.router.navigate(['/pages/aboutconsultant', id]);
  }
}
