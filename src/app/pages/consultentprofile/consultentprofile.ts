import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Firestore, collection, query, where, getDocs, doc, setDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

declare var bootstrap: any;
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
  // hasPendingPayment: boolean = false;
  timerInterval: any;

  constructor(
    private router: Router,
    private firestore: Firestore,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.loadConsultants();
    // this.auth.onAuthStateChanged(user => {
    //   if (user) this.checkPendingSessions();
    // });
  }

  // dismissPendingPayment(event: Event) {
  //   event.stopPropagation();
  //   this.hasPendingPayment = false;
  //   sessionStorage.setItem('pendingPaymentDismissed', 'true');
  // }

  // async checkPendingSessions() {
  //   const user = this.auth.currentUser;
  //   if (!user) return;

  //   if (sessionStorage.getItem('pendingPaymentDismissed') === 'true') {
  //     this.hasPendingPayment = false;
  //     return;
  //   }

  //   const q = query(
  //     collection(this.firestore, 'sessions'),
  //     where('clientUid', '==', user.uid),
  //     where('paymentStatus', '==', 'pending')
  //   );

  //   const querySnapshot = await getDocs(q);
  //   const now = new Date();

  //   this.hasPendingPayment = querySnapshot.docs.some(doc => {
  //     const data = doc.data();
  //     const sessionTime = this.parseSessionDateTime(data['availableDate'], data['availableTime']);
  //     return sessionTime > now;
  //   });
  // }

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

  async openSessionModal() {
    const user = this.auth.currentUser;
    if (!user) return;

    const q = query(
      collection(this.firestore, 'sessions'),
      where('clientUid', '==', user.uid)
    );

    const querySnapshot = await getDocs(q);
    const now = new Date();

    const sessions = querySnapshot.docs
      .map(doc => {
        const data = doc.data();
        const sessionDateTime = this.parseSessionDateTime(data['availableDate'], data['availableTime']);
        return {
          id: doc.id,
          ...data,
          sessionDateTime,
          isNearestUpcoming: false,
          // paymentStatus: data['paymentStatus'],
          isJoinEnabled: false
        };
      })
      .filter(session => session.sessionDateTime > now)
      .sort((a, b) => a.sessionDateTime.getTime() - b.sessionDateTime.getTime());

    // this.hasPendingPayment = sessions.some(s => s.paymentStatus === 'pending');

    if (sessions.length > 0) {
      sessions[0].isNearestUpcoming = true;
      sessions.forEach(session => {
        session.isJoinEnabled = false;
        this.setupCountdown(session);
      });
    }

    this.sessions = sessions;

    const modalElement = document.getElementById('sessionModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  parseSessionDateTime(dateStr: string, timeStr: string): Date {
    if (!dateStr || !timeStr) return new Date(0);

    const [year, month, day] = dateStr.split('-').map(Number);
    const [time, modifier] = timeStr.trim().toUpperCase().split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return new Date(year, month - 1, day, hours, minutes);
  }

  setupCountdown(session: any) {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const target = session.sessionDateTime.getTime();
      const diff = target - now;

      if (diff <= 0) {
        session.countdown = { hours: 0, minutes: 0, seconds: 0 };
        session.isJoinEnabled = session.paymentStatus === 'success';
        clearInterval(this.timerInterval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      session.countdown = { hours, minutes, seconds };
    }, 1000);
  }

  joinSession(session: any) {
    alert(`Joining session with ID: ${session.id}`);
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
        this.openSessionModal();
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

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigate(['home']);
    });
  }

  viewAbout(id: string) {
    this.router.navigate(['/pages/aboutconsultant', id]);
  }
}
