
// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Firestore, doc, getDoc, collection, setDoc, query, where, getDocs } from '@angular/fire/firestore';
// import { Auth } from '@angular/fire/auth';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';

// declare var Razorpay: any;

// @Component({
//   selector: 'app-client-session',
//   standalone: true,
//   templateUrl: './client.session.html',
//   styleUrls: ['./client.session.css'],
//   imports: [CommonModule, FormsModule]
// })
// export class ClientSession implements OnInit {
//   consultantId: string = '';
//   consultant: any = null;
//   selectedDate: string = '';
//   selectedTime: string = '';
//   selectedSlot: any = null;
//   clientId: string = '';
//   amount: number = 0;
//   timeSlots: any[] = [];
//   bookedSlots: string[] = [];
//   sessionId: string = ''; // ✅ Declare once

//   get allSlotsBooked(): boolean {
//     return this.timeSlots.length > 0 && !this.timeSlots.some(slot => slot.available);
//   }

//   constructor(
//     private route: ActivatedRoute,
//     private firestore: Firestore,
//     private auth: Auth,
//     private http: HttpClient,
//     private router: Router
//   ) {}

//   async ngOnInit() {
//     this.consultantId = this.route.snapshot.paramMap.get('id') || '';
//     const user = this.auth.currentUser;
//     if (user) this.clientId = user.uid;

//     if (this.consultantId) {
//       const docRef = doc(this.firestore, 'consultants', this.consultantId);
//       const docSnap = await getDoc(docRef);
//       if (docSnap.exists()) {
//         this.consultant = docSnap.data();
//         this.amount = this.consultant.consultationRates || 0;
//         if (this.selectedDate) await this.onDateChange();
//       }
//     }
//   }

//   async onDateChange() {
//     if (!this.selectedDate) return;

//     this.bookedSlots = [];

//     const sessionsRef = collection(this.firestore, 'sessions');
//     const q = query(
//       sessionsRef,
//       where('consultantUid', '==', this.consultantId),
//       where('availableDate', '==', this.selectedDate),
//       where('paymentStatus', 'in', ['pending', 'success'])
//     );

//     const querySnapshot = await getDocs(q);
//     this.bookedSlots = querySnapshot.docs.map(doc => doc.data()['availableTime']);
//     this.generateTimeSlots();
//   }

//   generateTimeSlots() {
//     if (!this.consultant?.availabilityFromTime || !this.consultant?.availabilityToTime) {
//       this.timeSlots = [];
//       return;
//     }

//     const slots = [];
//     const [fromHour, fromMinute] = this.consultant.availabilityFromTime.split(':').map(Number);
//     const [toHour, toMinute] = this.consultant.availabilityToTime.split(':').map(Number);

//     let currentHour = fromHour;
//     let currentMinute = fromMinute;

//     while (currentHour < toHour || (currentHour === toHour && currentMinute < toMinute)) {
//       const time24 = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
//       if (!this.bookedSlots.includes(time24)) {
//         const displayTime = this.formatDisplayTime(currentHour, currentMinute);
//         let endHour = currentHour;
//         let endMinute = currentMinute + 30;
//         if (endMinute >= 60) {
//           endMinute -= 60;
//           endHour++;
//         }
//         const endTime = this.formatDisplayTime(endHour, endMinute);

//         slots.push({
//           time24,
//           displayTime,
//           endTime,
//           available: true,
//           display: `${displayTime} - ${endTime}`
//         });
//       }

//       currentMinute += 30;
//       if (currentMinute >= 60) {
//         currentMinute = 0;
//         currentHour++;
//       }
//     }

//     this.timeSlots = slots;
//     this.selectedSlot = null;
//   }

//   private formatDisplayTime(hours: number, minutes: number): string {
//     const period = hours >= 12 ? 'PM' : 'AM';
//     const displayHours = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
//     return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
//   }

//   selectSlot(slot: any) {
//     if (slot.available) {
//       this.selectedSlot = slot;
//       this.selectedTime = slot.time24;
//     }
//   }

//   async bookSession() {
//     if (!this.selectedSlot || !this.selectedSlot.available) {
//       return alert('Please select a valid available time slot');
//     }

//     const user = this.auth.currentUser;
//     if (!user) return alert('Please log in to book a session.');

//     // ✅ Generate sessionId ONCE and reuse
//     this.sessionId = doc(collection(this.firestore, 'sessions')).id;
//     const sessionRef = doc(this.firestore, 'sessions', this.sessionId);

//     // Fetch client name
//     const clientDocSnap = await getDoc(doc(this.firestore, 'clients', user.uid));
//     let clientName = user.displayName || '';
//     if (clientDocSnap.exists()) {
//       clientName = clientDocSnap.data()['name'] || clientName;
//     }

//     const sessionData = {
//       id: this.sessionId,
//       clientUid: user.uid,
//       clientName,
//       consultantUid: this.consultantId,
//       availableDate: this.selectedDate,
//       availableTime: this.selectedTime,
//       displayTime: this.selectedSlot.display,
//       consultationRates: this.amount,
//       paymentStatus: 'pending',
//       createdAt: new Date().toISOString()
//     };

//     try {
//       await setDoc(sessionRef, sessionData);

//       const res: any = await this.http.post('http://localhost:3000/api/create-order', {
//         consultantId: this.consultantId,
//         amount: this.amount,
//         sessionId: this.sessionId
//       }).toPromise();

//       const paymentId = doc(collection(this.firestore, 'payments')).id;

//       const rzp = new Razorpay({
//         key: res.key,
//         amount: this.amount * 100,
//         currency: 'INR',
//         name: 'Advisora',
//         description: 'Session Booking',
//         order_id: res.orderId,
//         handler: async (response: any) => {
//           // ✅ Update payment status only (no Razorpay fields in sessions)
//           await setDoc(sessionRef, { paymentStatus: 'success' }, { merge: true });

//           // ✅ Save Razorpay payment details separately
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
//         }
//       });

//       rzp.on('payment.failed', async (response: any) => {
//         await setDoc(sessionRef, {
//           paymentStatus: 'failed',
//           razorpay_error: response.error
//         }, { merge: true });

//         alert('Payment failed. Please try again.');
//       });

//       rzp.open();
//     } catch (err) {
//       console.error('Error initiating booking:', err);
//       alert('Booking failed. Please try again.');
//     }
//   }
// }


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
  selectedTime: string = '';
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
    if (!this.consultant?.availabilityFromTime || !this.consultant?.availabilityToTime) {
      this.timeSlots = [];
      return;
    }

    const slots = [];
    const [fromHour, fromMinute] = this.consultant.availabilityFromTime.split(':').map(Number);
    const [toHour, toMinute] = this.consultant.availabilityToTime.split(':').map(Number);

    let currentHour = fromHour;
    let currentMinute = fromMinute;

    while (currentHour < toHour || (currentHour === toHour && currentMinute < toMinute)) {
      const time24 = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      if (!this.bookedSlots.includes(time24)) {
        const displayTime = this.formatDisplayTime(currentHour, currentMinute);
        let endHour = currentHour;
        let endMinute = currentMinute + 30;
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

      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour++;
      }
    }

    this.timeSlots = slots;
    this.selectedSlot = null;
  }

  private formatDisplayTime(hours: number, minutes: number): string {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  selectSlot(slot: any) {
    if (slot.available) {
      this.selectedSlot = slot;
      this.selectedTime = slot.time24;
    }
  }

  confirmBooking(isPayLater: boolean) {
    this.payLater = isPayLater;
    this.bookSession();
  }

  async bookSession() {
    if (!this.selectedSlot || !this.selectedSlot.available) {
      return alert('Please select a valid available time slot');
    }

    const user = this.auth.currentUser;
    if (!user) return alert('Please log in to book a session.');

    const clientDocSnap = await getDoc(doc(this.firestore, 'clients', user.uid));
    let clientName = user.displayName || '';
    if (clientDocSnap.exists()) {
      clientName = clientDocSnap.data()['name'] || clientName;
    }

    // Generate IDs
    this.sessionId = doc(collection(this.firestore, 'sessions')).id;
    const sessionRef = doc(this.firestore, 'sessions', this.sessionId);
    const paymentId = doc(collection(this.firestore, 'payments')).id;

    const sessionData = {
      id: this.sessionId,
      clientUid: user.uid,
      clientName,
      consultantUid: this.consultantId,
      availableDate: this.selectedDate,
      availableTime: this.selectedTime,
      displayTime: this.selectedSlot.display,
      consultationRates: this.amount,
      createdAt: new Date().toISOString()
    };

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
      const res: any = await this.http.post('http://localhost:3000/api/create-order', {
        consultantId: this.consultantId,
        amount: this.amount,
        sessionId: this.sessionId
      }).toPromise();

      const rzp = new Razorpay({
        key: res.key,
        amount: this.amount * 100,
        currency: 'INR',
        name: 'Advisora',
        description: 'Session Booking',
        order_id: res.orderId,
        handler: async (response: any) => {
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
        theme: {
          color: '#F37254'
        },
        modal: {
          ondismiss: () => {
            alert('Payment cancelled. Please try again.');
            this.selectedSlot = null;
            this.selectedTime = '';
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
