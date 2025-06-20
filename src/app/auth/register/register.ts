import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Auth, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html'
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private firestore: Firestore
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  async onSubmit() {
    if (this.registerForm.invalid) {
      alert('Please fill the form correctly!');
      return;
    }

    const { name, email, phone, password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      console.log("Creating user in Firebase Auth...");
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      console.log("User created:", user.uid);

      await sendEmailVerification(user);
      alert('Verification email sent! Please check your inbox.');

      console.log("Saving user data to Firestore...");
      await setDoc(doc(this.firestore, 'users', user.uid), {
        name,
        email,
        phone,
        createdAt: new Date()
      });
      console.log("User data saved in Firestore successfully.");

      this.registerForm.reset();
      alert('Registration complete!');
    } catch (error: any) {
      console.error("Registration failed:", error);
      alert('Registration failed: ' + error.message);
    }
  }
}
