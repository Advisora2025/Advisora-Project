import { Component } from '@angular/core';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-consultant.payment',  
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultant.payment.html',
  styleUrl: './consultant.payment.css'
})
export class ConsultantPayment {

   keyId = '';
  keySecret = '';

  constructor(private firestore: Firestore, private auth: Auth) {}

  async saveKeys() {
    const uid = this.auth.currentUser?.uid;
    if (!uid) return alert('Not logged in');

    const ref = doc(this.firestore, `consultants/${uid}`);
    await setDoc(ref, {
      razorpayKeyId: this.keyId,
      razorpayKeySecret: this.keySecret,
    }, { merge: true });

    alert('Keys saved');
  }
}
