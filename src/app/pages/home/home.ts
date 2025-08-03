// home.ts (Updated login logic)
import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth, signInWithEmailAndPassword, sendPasswordResetEmail } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';

declare const bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
})
export class Home implements AfterViewInit {
  email = '';
  password = '';
  resetEmail = '';

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    const modalElement = document.getElementById('signupModal');
    if (modalElement && window.location.href.includes('?showLogin=true')) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
      history.replaceState({}, document.title, window.location.pathname);
    }
  }

  async onLogin() {
    try {
      const userCred = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      const uid = userCred.user.uid;
      const userDocRef = doc(this.firestore, `users/${uid}`);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData: any = userSnap.data();
        const role = userData.role;

        // Auto-create consultant doc if not already created
        if (role === 'consultant') {
          const consultantRef = doc(this.firestore, `consultants/${uid}`);
          const consultantSnap = await getDoc(consultantRef);
          if (!consultantSnap.exists()) {
            await setDoc(consultantRef, {
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              uid,
              createdAt: new Date()
            });
          }
        }

        const modalElement = document.getElementById('signupModal');
        if (modalElement) {
          const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
          modal.hide();
        }

        switch (role) {
          case 'client':
            this.router.navigateByUrl('/pages/clientdashboard');
            break;
          case 'consultant':
            this.router.navigateByUrl('/consultant/consultantdashboard');
            break;
          case 'admin':
            this.router.navigateByUrl('/admin');
            break;
          default:
            alert('Unknown role. Please contact support.');
        }
      } else {
        alert('User record not found in database.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      alert('Login failed: ' + err.message);
    }
  }

  goToRegister(event: Event) {
    event.preventDefault();
    this.router.navigateByUrl('/auth/register');
  }

  showForgotModal() {
    const modalElement = document.getElementById('forgotModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();
    }
  }

  async sendResetLink() {
    if (!this.resetEmail) {
      alert('Please enter your email.');
      return;
    }

    try {
      await sendPasswordResetEmail(this.auth, this.resetEmail);
      alert('Reset link sent! Please check your email.');

      const modalElement = document.getElementById('forgotModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
        modal.hide();
      }

      this.resetEmail = '';
    } catch (err: any) {
      console.error('Reset email error:', err);
      alert('Failed to send reset link: ' + err.message);
    }
  }
}