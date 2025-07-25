// import { Component } from '@angular/core';
// import { Firestore, doc, setDoc } from '@angular/fire/firestore';
// import { Auth } from '@angular/fire/auth';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';


// @Component({
//   selector: 'app-consultant.payment',  
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './consultant.payment.html',
//   styleUrl: './consultant.payment.css'
// })
// export class ConsultantPayment {

//    keyId = '';
//   keySecret = '';

//   constructor(private firestore: Firestore, private auth: Auth) {}

//   async saveKeys() {
//     const uid = this.auth.currentUser?.uid;
//     if (!uid) return alert('Not logged in');

//     const ref = doc(this.firestore, `consultants/${uid}`);
//     await setDoc(ref, {
//       razorpayKeyId: this.keyId,
//       razorpayKeySecret: this.keySecret,
//     }, { merge: true });

//     alert('Keys saved');
//   }
// }

import { Component, OnInit } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
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
export class ConsultantPayment implements OnInit {
  keyId = '';
  keySecret = '';
  editable = false;
  isLoading = true;
  showSecret: boolean = false;
  constructor(private firestore: Firestore, private auth: Auth) {}

  async ngOnInit() {
    const uid = this.auth.currentUser?.uid;
    if (!uid) return;

    const ref = doc(this.firestore, `consultants/${uid}`);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      const data = snapshot.data();
      this.keyId = data['razorpayKeyID'] || '';
      this.keySecret = data['razorpayKeySecret'] || '';
    }
    this.isLoading = false;
  }

  async saveKeys() {
    const uid = this.auth.currentUser?.uid;
    if (!uid) return alert('Not logged in');

    const ref = doc(this.firestore, `consultants/${uid}`);
    await setDoc(ref, {
      razorpayKeyID: this.keyId,
      razorpayKeySecret: this.keySecret,
    }, { merge: true });

    alert('Keys saved');
    this.editable = false;
  }

  clearFields() {
    this.keyId = '';
    this.keySecret = '';
  }

  enableEdit() {
    this.editable = true;
  }

  toggleSecretVisibility() {
  this.showSecret = !this.showSecret;
}
}
