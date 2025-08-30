import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, collection, setDoc, query, where, getDocs } from '@angular/fire/firestore';
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
  imports: [CommonModule, FormsModule]
})
export class ClientSession implements OnInit {
  consultantId: string = '';
  consultant: any = null;
  selectedDate: string = '';
  selectedSlot: any = null;
  clientId: string = '';
  amount: number = 0;
  timeSlots: any[] = [];
  bookedSlots: string[] = [];
  sessionId: string = '';
  payLater: boolean = false;

  get allSlotsBooked(): boolean {
    return this.timeSlots.length > 0 && !this.timeSlots.some(slot => slot.available);
  }

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
    if (user) this.clientId = user.uid;

    if (this.consultantId) {
      const docRef = doc(this.firestore, 'consultants', this.consultantId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.consultant = docSnap.data();

        // Filter out past availableDates
        // Filter out today's and past availableDates (only future dates)
if (this.consultant.availableDates) {
  const today = new Date().setHours(0, 0, 0, 0);
  this.consultant.availableDates = this.consultant.availableDates
    .filter((dateStr: string) => {
      const date = new Date(dateStr).setHours(0, 0, 0, 0);
      return date > today; // only future dates
    })
    .sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime());
}


        this.amount = this.consultant.consultationRates || 0;
        if (this.selectedDate) await this.onDateChange();
      }
    }
  }

  async onDateChange() {
    if (!this.selectedDate) return;

    this.bookedSlots = [];

    const sessionsRef = collection(this.firestore, 'sessions');
    const q = query(
      sessionsRef,
      where('consultantUid', '==', this.consultantId),
      where('availableDate', '==', this.selectedDate),
      where('paymentStatus', 'in', ['pending', 'success'])
    );

    const querySnapshot = await getDocs(q);
    this.bookedSlots = querySnapshot.docs.map(doc => doc.data()['availableTime']);
    this.generateTimeSlots();
  }

  generateTimeSlots() {
  if (!this.consultant?.availabilityFromTime || !this.consultant?.availabilityToTime || !this.selectedDate) {
    this.timeSlots = [];
    return;
  }

  const slots = [];

  // Parse available time strings
  const fromTime = this.parseTimeString(this.consultant.availabilityFromTime);
  const toTime = this.parseTimeString(this.consultant.availabilityToTime);

  // Parse selected date
  const [year, month, day] = this.selectedDate.split('-').map(Number);
  const selectedDateObj = new Date(year, month - 1, day); // month is 0-indexed

  // Get current date/time
  const now = new Date();

  const isToday =
    now.getFullYear() === selectedDateObj.getFullYear() &&
    now.getMonth() === selectedDateObj.getMonth() &&
    now.getDate() === selectedDateObj.getDate();

  // Build starting and ending time on selected date
  let current = new Date(year, month - 1, day, fromTime.hour, fromTime.minute, 0, 0);
  const end = new Date(year, month - 1, day, toTime.hour, toTime.minute, 0, 0);

  console.log('Generating slots for:', this.selectedDate);
  console.log('Is today?', isToday);
  console.log('Current time:', now.toLocaleTimeString());

  while (current < end) {
    const hour = current.getHours();
    const minute = current.getMinutes();
    const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    const isFutureSlot = !isToday || current > now;

    console.log(`[${time24}] Slot time: ${current.toLocaleTimeString()} | isFutureSlot: ${isFutureSlot}`);

    if (!this.bookedSlots.includes(time24) && isFutureSlot) {
      const displayTime = this.formatDisplayTime(hour, minute);

      let endHour = hour;
      let endMinute = minute + 30;
      if (endMinute >= 60) {
        endMinute -= 60;
        endHour++;
      }

      const endTime = this.formatDisplayTime(endHour, endMinute);

      slots.push({
        time24,
        displayTime,
        endTime,
        available: true,
        display: `${displayTime} - ${endTime}`
      });
    }

    current.setMinutes(current.getMinutes() + 30);
  }

  this.timeSlots = slots;
  this.selectedSlot = null;

  console.log('Final available slots:', this.timeSlots);
}


  parseTimeString(timeStr: string): { hour: number; minute: number } {
    try {
      const [time, period] = timeStr.trim().split(' ');
      let [hour, minute] = time.split(':').map(Number);
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      return { hour, minute };
    } catch {
      console.warn('Invalid time string:', timeStr);
      return { hour: 9, minute: 0 }; // fallback default
    }
  }

  formatDisplayTime(hour: number, minute: number): string {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    const minStr = minute.toString().padStart(2, '0');
    return `${hour12}:${minStr} ${ampm}`;
  }

  selectSlot(slot: any) {
    if (!slot.available) return;
    this.selectedSlot = slot;
  }

  confirmBooking(isPayLater: boolean) {
    this.payLater = isPayLater;
    this.bookSession();
  }

//   async bookSession() {
//     if (!this.selectedSlot || !this.selectedSlot.available) {
//       return alert('Please select a valid available time slot');
//     }

//     const user = this.auth.currentUser;
//     if (!user) return alert('Please log in to book a session.');

//     const clientDocSnap = await getDoc(doc(this.firestore, 'clients', user.uid));
//     let clientName = user.displayName || '';
//     if (clientDocSnap.exists()) {
//       clientName = clientDocSnap.data()['name'] || clientName;
//     }

//     this.sessionId = doc(collection(this.firestore, 'sessions')).id;
//     const sessionRef = doc(this.firestore, 'sessions', this.sessionId);
//     const paymentId = doc(collection(this.firestore, 'payments')).id;

//     const sessionData = {
//   id: this.sessionId,
//   clientUid: user.uid,
//   clientName,
//   consultantUid: this.consultantId,
//   availableDate: this.selectedDate,
//   availableTime: this.selectedSlot.time24,             // 24-hr format
//   availableTimeDisplay: this.selectedSlot.displayTime, // AM/PM format
//   displayTime: this.selectedSlot.display,              // Full range (e.g., 10:00 AM - 10:30 AM)
//   consultationRates: this.amount,
//   createdAt: new Date().toISOString()
// };


//     if (this.payLater) {
//       await setDoc(sessionRef, {
//         ...sessionData,
//         paymentStatus: 'pending',
//         bookingType: 'pay_later'
//       });
//       alert('Session booked. You can pay later.');
//       this.router.navigate(['/pages/consultentprofile']);
//       return;
//     }

//     try {
//       const res: any = await this.http.post('https://advisorabackend.vercel.app/api/razorpay', {
//         consultantId: this.consultantId,
//         amount: this.amount,
//         sessionId: this.sessionId
//       }).toPromise();

//       const rzp = new Razorpay({
//         key: res.key,
//         amount: this.amount * 100,
//         currency: 'INR',
//         name: 'Advisora',
//         description: 'Session Booking',
//         order_id: res.orderId,
//         handler: async (response: any) => {
//           await setDoc(sessionRef, {
//             ...sessionData,
//             paymentStatus: 'success',
//             bookingType: 'pay_now'
//           });

//           await setDoc(doc(this.firestore, 'payments', paymentId), {
//             paymentId,
//             sessionId: this.sessionId,
//             clientUid: user.uid,
//             consultantUid: this.consultantId,
//             amount: this.amount,
//             orderId: response.razorpay_order_id,
//             paymentGateway_id: response.razorpay_payment_id,
//             signature: response.razorpay_signature,
//             createdAt: new Date().toISOString()
//           });

//           alert('Payment successful & session booked!');
//           this.router.navigate(['/pages/consultentprofile']);
//         },
//         prefill: {
//           name: clientName,
//           email: user.email || ''
//         },
//         theme: {
//           color: '#F37254'
//         },
//         modal: {
//           ondismiss: () => {
//             alert('Payment cancelled. Please try again.');
//             this.selectedSlot = null;
//             this.payLater = false;
//           }
//         }
//       });

//       rzp.on('payment.failed', () => {
//         alert('Payment failed. Please try again.');
//       });

//       rzp.open();
//     } catch (err) {
//       console.error('Error initiating payment:', err);
//       alert('Booking failed. Please try again.');
//     }
//   }
async bookSession() {
  if (!this.selectedSlot || !this.selectedSlot.available) {
    return alert('Please select a valid available time slot.');
  }

  const user = this.auth.currentUser;
  if (!user) return alert('Please log in to book a session.');

  const clientDocSnap = await getDoc(doc(this.firestore, 'clients', user.uid));
  let clientName = user.displayName || '';
  if (clientDocSnap.exists()) {
    clientName = clientDocSnap.data()['name'] || clientName;
  }

  this.sessionId = doc(collection(this.firestore, 'sessions')).id;
  const sessionRef = doc(this.firestore, 'sessions', this.sessionId);
  const paymentId = doc(collection(this.firestore, 'payments')).id;

  const sessionData = {
    id: this.sessionId,
    clientUid: user.uid,
    clientName,
    consultantUid: this.consultantId,
    availableDate: this.selectedDate,
    availableTime: this.selectedSlot.time24,
    availableTimeDisplay: this.selectedSlot.displayTime,
    displayTime: this.selectedSlot.display,
    consultationRates: this.amount,
    createdAt: new Date().toISOString()
  };

  // Pay Later Flow
  if (this.payLater) {
    await setDoc(sessionRef, {
      ...sessionData,
      paymentStatus: 'pending',
      bookingType: 'pay_later'
    });
    alert('Session booked. You can pay later.');
    this.router.navigate(['/pages/consultentprofile']);
    return;
  }

  try {

    // CORS-safe backend call to Vercel
    const res: any = await this.http.post(
     'https://advisora-backend.vercel.app/api/create-order',
      {
        amount: this.amount,
        receipt: this.sessionId
      },
      { headers: { 'Content-Type': 'application/json' } }
    ).toPromise();

    const rzp = new Razorpay({
      key: res.key_id || res.key,  // your backend should return key_id
      amount: this.amount * 100,
      currency: 'INR',
      name: 'Advisora',
      description: 'Session Booking',
      order_id: res.id,  // order ID returned from Razorpay backend
      handler: async (response: any) => {
        // Payment successful
        await setDoc(sessionRef, {
          ...sessionData,
          paymentStatus: 'success',
          bookingType: 'pay_now'
        });

        await setDoc(doc(this.firestore, 'payments', paymentId), {
          paymentId,
          sessionId: this.sessionId,
          clientUid: user.uid,
          consultantUid: this.consultantId,
          amount: this.amount,
          orderId: response.razorpay_order_id,
          paymentGateway_id: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          createdAt: new Date().toISOString()
        });

        alert('Payment successful & session booked!');
        this.router.navigate(['/pages/consultentprofile']);
      },
      prefill: {
        name: clientName,
        email: user.email || ''
      },
      theme: { color: '#F37254' },
      modal: {
        ondismiss: () => {
          alert('Payment cancelled. Please try again.');
          this.selectedSlot = null;
          this.payLater = false;
        }
      }
    });

    rzp.on('payment.failed', () => {
      alert('Payment failed. Please try again.');
    });

    rzp.open();

  } catch (err) {
    console.error('Error initiating payment:', err);
    alert('Booking failed. Please try again.');
  }
}

}
