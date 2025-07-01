import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-consultantdashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './consultantdashboard.html',
  styleUrl: './consultantdashboard.css'
})
export class Consultantdashboard implements OnInit {
  consultantData: any = {
    name: '',
    email: '',
    phone: '',
    bio: '',
    expertise: '',
    availabilityFrom: '',
    availabilityTo: '',
    consultationRates: null,
    imageUrl: '',
    certificateUrl: ''
  };

  userId: string = '';
  editProfile: boolean = false;
  uploadingImage = false;
  uploadingCertificate = false;

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {}

  async ngOnInit() {
    const user = this.auth.currentUser;
    if (user) {
      this.userId = user.uid;
      this.consultantData.name = user.displayName || '';
      this.consultantData.email = user.email || '';
      this.consultantData.phone = user.phoneNumber || '';

      const docRef = doc(this.firestore, 'consultants', this.userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        this.consultantData = { ...this.consultantData, ...docSnap.data() };
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  async uploadImage(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.uploadingImage = true;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'consultant_unsigned');
    formData.append('folder', 'consultant');

    const res = await fetch('https://api.cloudinary.com/v1_1/dpew5sddn/image/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    this.consultantData.imageUrl = data.secure_url;
    this.uploadingImage = false;
  }

  async uploadCertificate(event: any) {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('PDF file must be less than 10MB.');
      return;
    }

    this.uploadingCertificate = true;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'consultant_unsigned');
    formData.append('folder', 'consultant');

    const res = await fetch('https://api.cloudinary.com/v1_1/dpew5sddn/raw/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    this.consultantData.certificateUrl = data.secure_url;
    this.uploadingCertificate = false;
  }

  viewCertificate() {
    if (this.consultantData.certificateUrl) {
      window.open(this.consultantData.certificateUrl, '_blank');
    } else {
      alert('Certificate not uploaded yet.');
    }
  }

  async saveProfile() {
    const requiredFields = [
      'name', 'email', 'phone', 'bio', 'expertise', 'availabilityFrom',
      'availabilityTo', 'consultationRates', 'imageUrl', 'certificateUrl'
    ];

    for (let field of requiredFields) {
      if (!this.consultantData[field]) {
        alert(`Please fill in ${field}.`);
        return;
      }
    }

    const docRef = doc(this.firestore, 'consultants', this.userId);
    await setDoc(docRef, this.consultantData);
    this.editProfile = false;
    alert('Profile saved successfully!');
  }

  cancelEdit() {
    this.editProfile = false;
  }

  logout() {
    this.auth.signOut();
    this.router.navigate(['/']);
  }
}

