import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
declare var bootstrap: any;


@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
   standalone: true
})
export class Home {

   email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  onLogin() {
  if (this.email === 'admin' && this.password === 'admin') {
    // ✅ Hide the modal
    const modal = document.getElementById('signupModal');
    if (modal) {
      const bsModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
      bsModal.hide();
    }

    // ✅ Navigate after closing
    setTimeout(() => {
      this.router.navigate(['/admin/dashboard']);
    }, 300);
  } else {
    alert('Invalid credentials');
  }
}


goToRegister(event: Event) {
  event.preventDefault(); // ✅ Stop <a href="#"> from reloading the page

  const modal = document.getElementById('signupModal');
  if (modal) {
    const bsModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
    bsModal.hide();
  }

  // Wait for modal to fully close
  setTimeout(() => {
    this.router.navigate(['/auth/register']);
  }, 300);
}
}
