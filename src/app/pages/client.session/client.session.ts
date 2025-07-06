import { Component, OnInit } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { Firestore, doc, getDoc, collection, setDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

declare var Razorpay: any;

@Component({
  selector: 'app-client-session',
  standalone: true,
  templateUrl: './client.session.html',
  styleUrls: ['./client.session.css'],
  imports: [CommonModule, FormsModule,]
})
export class ClientSession implements OnInit {
  consultantId: string = '';
  consultant: any = null;
  selectedDate: string = '';
  selectedTime: string = '';
  clientId: string = '';
  amount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private auth: Auth,
    private http: HttpClient,
      private router: Router
  ) {}

  async ngOnInit() {
    this.consultantId = this.route.snapshot.paramMap.get('id') || '';
    const user = this.auth.currentUser;
    if (user) {
      this.clientId = user.uid;
    }

    if (this.consultantId) {
      const docRef = doc(this.firestore, 'consultants', this.consultantId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.consultant = docSnap.data();
        this.amount = this.consultant?.consultationRates || 0;
      } else {
        console.error('Consultant not found');
      }
    }
  }

  async bookSession() {
    const user = this.auth.currentUser;
    if (!user) return alert('Please log in to book a session.');
    if (!this.selectedDate || !this.selectedTime) return alert('Please select date and time.');

    const clientDocRef = doc(this.firestore, 'clients', user.uid);
      const clientDocSnap = await getDoc(clientDocRef);
      let clientName = '';
      if (clientDocSnap.exists()) {
        const clientData = clientDocSnap.data();
        clientName = clientData['name'] || '';
      } else {
        console.warn('Client name not found in Firestore.');
      }
    const sessionId = doc(collection(this.firestore, 'sessions')).id;

    const sessionData = {
      id: sessionId,
      clientUid: user.uid,
      clientName: clientName,
      clientEmail: user.email || '',
      consultantUid: this.consultantId,
      consultantEmail: this.consultant?.email || '',
      availableDate: this.selectedDate,
      availableTime: this.selectedTime,
      consultationRates: this.amount,
      paymentStatus: 'pending',
      createdAt: new Date()
    };

    try {
      // Step 1: Save booking with pending payment
      const sessionRef = doc(this.firestore, 'sessions', sessionId);
      await setDoc(sessionRef, sessionData);

      // Step 2: Call backend to create Razorpay order
      const res: any = await this.http.post('http://localhost:3000/api/create-order', {
        consultantId: this.consultantId,
        amount: this.amount,
        sessionId: sessionId
      }).toPromise();

      const paymentId = doc(collection(this.firestore, 'payments')).id;

      // Step 3: Open Razorpay checkout
      const rzp = new Razorpay({
        key: res.key,
        amount: this.amount * 100,
        currency: 'INR',
        name: 'Advisora',
        description: 'Session Booking',
        order_id: res.orderId,
        handler: async (response: any) => {
          // Step 4: Save payment success
          await setDoc(sessionRef, {
            paymentStatus: 'success',
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          }, { merge: true });

          await setDoc(doc(this.firestore, 'payments', paymentId), {
          paymentId: paymentId,
          sessionId: sessionId,
          clientUid: user.uid,
          clientEmail: user.email || '',
          consultantUid: this.consultantId,
          consultantEmail: this.consultant?.email || '',
          amount: this.amount,
          orderId: response.razorpay_order_id,
          createdAt: new Date()
        });

          alert('Payment successful & session booked!');
          this.selectedTime = '';
          this.selectedDate = '';
          this.router.navigate(['/pages/consultentprofile']); 
        },
        prefill: {
          name: user.displayName || '',
          email: user.email || ''
        }
      });

      rzp.open();

    } catch (err) {
      console.error('Error booking session:', err);
      alert('Booking failed. Try again.');
      this.router.navigate(['/pages/consultentprofile']); 
    }
  }
}
