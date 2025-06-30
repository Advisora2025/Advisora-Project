// register.ts (Updated)
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Auth, createUserWithEmailAndPassword, sendEmailVerification } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
})
export class Register {
  registerForm!: FormGroup;
  selectedRole: 'client' | 'consultant' | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    this.initializeForm();
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['']
    });
  }

  selectRole(role: 'client' | 'consultant') {
    this.selectedRole = role;
    this.registerForm.patchValue({ role });
  }

  async onSubmit() {
    if (
      this.registerForm.invalid ||
      this.registerForm.value.password !== this.registerForm.value.confirmPassword
    ) {
      alert('Please fill the form correctly and ensure passwords match.');
      return;
    }

    const { email, password, name, phone, role } = this.registerForm.value;

    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const uid = userCredential.user.uid;

      // Add to 'users' collection
      await setDoc(doc(this.firestore, 'users', uid), {
        name,
        email,
        phone,
        role,
        uid
      });

      if (role === 'client') {
        await setDoc(doc(this.firestore, 'clients', uid), {
          name,
          email,
          phone,
          uid,
          createdAt: new Date()
        });
      }

      if (role === 'consultant') {
        await setDoc(doc(this.firestore, 'consultants', uid), {
          name,
          email,
          phone,
          uid,
          createdAt: new Date()
        });
      }

      await sendEmailVerification(userCredential.user);

      alert('Registration successful! Please check your email to verify your account.');
      this.router.navigate(['/home'], { queryParams: { showLogin: true } });

    } catch (error: any) {
      console.error('Registration Error:', error);
      alert('Registration failed: ' + error.message);
    }
  }
}
