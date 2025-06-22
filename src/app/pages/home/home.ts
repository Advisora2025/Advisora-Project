import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

declare var bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

  email: string = '';
  password: string = '';

  private auth: Auth = inject(Auth);

  constructor(private router: Router) {}

  onLogin() {
    signInWithEmailAndPassword(this.auth, this.email, this.password)
      .then(() => {
        // ✅ Close the modal
        const modal = document.getElementById('signupModal');
        if (modal) {
          const bsModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
          bsModal.hide();
        }

        // ✅ Navigate without setTimeout (not needed)
        this.router.navigate(['/pages/clientdashboard']);
      })
      .catch((error) => {
        alert('Invalid credentials');
        console.error('Login error:', error.message);
      });
  }

  goToRegister(event: Event) {
    event.preventDefault();

    const modal = document.getElementById('signupModal');
    if (modal) {
      const bsModal = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
      bsModal.hide();
    }

    this.router.navigate(['/auth/register']);
  }
}
