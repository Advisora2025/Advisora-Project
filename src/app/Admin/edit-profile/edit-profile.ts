import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-edit-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css'
})
export class EditProfile {
 adminName = 'Admin Name';
  selectedImage: File | null = null;
  previewUrl: string | ArrayBuffer | null = '';

  onImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedImage = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    // Save name and image
    alert('Profile updated (simulated).');
  }

  closeModal() {
    const modal = document.getElementById('editProfileModal');
    if (modal) modal.style.display = 'none';
  }
}
