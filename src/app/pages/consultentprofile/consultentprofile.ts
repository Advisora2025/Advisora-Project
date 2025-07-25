import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Firestore, collection, query, where, getDocs, doc,setDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

declare var bootstrap: any; // Required for Bootstrap Modal
declare var Razorpay: any;
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
  hasPendingPayment: boolean = false;

  constructor(
    private router: Router,
    private firestore: Firestore,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.loadConsultants();
     this.auth.onAuthStateChanged((user) => {
    if (user) {
      this.checkPendingSessions();
    }
  });
  }
  dismissPendingPayment(event: Event) {
  event.stopPropagation(); // prevent triggering openSessionModal()
  this.hasPendingPayment = false;
}


  // async checkPendingSessions() {
  //       const user = this.auth.currentUser;
  //       if (!user) return;

  //       const q = query(
  //         collection(this.firestore, 'sessions'),
  //         where('clientUid', '==', user.uid),
  //         where('paymentStatus', '==', 'pending')
  //       );

  //       const querySnapshot = await getDocs(q);
  //       const now = new Date();

  //       // Check if any pending session is upcoming
  //       this.hasPendingPayment = querySnapshot.docs.some(doc => {
  //         const data = doc.data();
  //         const sessionTime = new Date(`${data['availableDate']}T${data['availableTime']}`);

  //         return sessionTime > now;
  //       });
  // }
  async checkPendingSessions() {
    const user = this.auth.currentUser;
    if (!user) return;

    // If alert was dismissed earlier in this session, don't show it again
    if (sessionStorage.getItem('pendingPaymentDismissed') === 'true') {
      this.hasPendingPayment = false;
      return;
    }

    const q = query(
      collection(this.firestore, 'sessions'),
      where('clientUid', '==', user.uid),
      where('paymentStatus', '==', 'pending')
    );

    const querySnapshot = await getDocs(q);
    const now = new Date();

    // Show only if any pending session is upcoming
    this.hasPendingPayment = querySnapshot.docs.some(doc => {
      const data = doc.data();
      const sessionTime = new Date(`${data['availableDate']}T${data['availableTime']}`);
      return sessionTime > now;
    });
  }


  loadConsultants() {
    const colRef = collection(this.firestore, 'consultants');
    const acceptedQuery = query(colRef, where('status', '==', 'accepted'));
    getDocs(acceptedQuery).then(snapshot => {
      this.consultants = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });
  }

  // async openSessionModal() {
  //   const user = this.auth.currentUser;
  //   if (!user) return;

  //   const q = query(
  //     collection(this.firestore, 'sessions'),
  //     where('clientUid', '==', user.uid)
  //   );
  //   const querySnapshot = await getDocs(q);
  //   const unsortedSessions = querySnapshot.docs.map(doc => doc.data());

  //   // Sort by availableDate and availableTime (newest first)
  //   this.sessions = unsortedSessions.sort((a: any, b: any) => {
  //     const dateTimeA = new Date(`${a.availableDate} ${a.availableTime}`);
  //     const dateTimeB = new Date(`${b.availableDate} ${b.availableTime}`);
  //     return dateTimeB.getTime() - dateTimeA.getTime(); // descending order
  //   });

  //   const modalElement = document.getElementById('sessionModal');
  //   if (modalElement) {
  //     const modal = new bootstrap.Modal(modalElement);
  //     modal.show();
  //   }
  // }
async openSessionModal() {
  const user = this.auth.currentUser;
  if (!user) return;

  const q = query(
    collection(this.firestore, 'sessions'),
    where('clientUid', '==', user.uid)
  );
  const querySnapshot = await getDocs(q);
  const now = new Date();

  // Map sessions with parsed datetime and filter only future sessions
  let sessions = querySnapshot.docs
    .map(doc => doc.data())
    .map((session: any) => {
      const sessionDateTime = new Date(`${session.availableDate}T${session.availableTime}`);
      return {
        ...session,
        sessionDateTime
      };
    })
    .filter(session => session.sessionDateTime > now)
    .sort((a, b) => a.sessionDateTime.getTime() - b.sessionDateTime.getTime());

    this.hasPendingPayment = sessions.some(s => s.paymentStatus === 'pending');

  // Mark only the nearest upcoming session
  if (sessions.length > 0) {
    sessions[0].isNearestUpcoming = true;
  }

  this.sessions = sessions;

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

  

  async retryPayment(session: any) {
  const user = this.auth.currentUser;
  if (!user) return;

  const res: any = await fetch('http://localhost:3000/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      consultantId: session.consultantUid,
      amount: session.consultationRates,
      sessionId: session.id
    })
  }).then(res => res.json());

  const paymentId = `${Date.now()}_${user.uid}`;

  const rzp = new Razorpay({
    key: res.key,
    amount: session.consultationRates * 100,
    currency: 'INR',
    name: 'Advisora',
    description: 'Session Payment',
    order_id: res.orderId,
    handler: async (response: any) => {
      const sessionRef = doc(this.firestore, 'sessions', session.id);
      await setDoc(sessionRef, { paymentStatus: 'success' }, { merge: true });

      await setDoc(doc(this.firestore, 'payments', paymentId), {
        paymentId,
        sessionId: session.id,
        clientUid: user.uid,
        consultantUid: session.consultantUid,
        amount: session.consultationRates,
        orderId: response.razorpay_order_id,
        paymentGateway_id: response.razorpay_payment_id,
        signature: response.razorpay_signature,
        createdAt: new Date().toISOString()
      });

      alert('Payment successful!');
      this.openSessionModal(); // reload modal
    },
    prefill: {
      name: user.displayName,
      email: user.email
    },
    theme: {
      color: '#F37254'
    }
  });

  rzp.on('payment.failed', () => {
    alert('Payment failed. Please try again.');
  });

  rzp.open();
}

}
