import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consultent-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultentdashboard.html',
})
export class ConsultentDashboard implements OnInit {
  name = '';
  bio = '';
  availabilityFrom = '';
  availabilityTo = '';
  rates = '0';
  expertise = '';
  imageUrl = '';
  certificateUrl = '';
  uploading = false;
  certificateUploading = false;
  viewMode = true;

  constructor(
    private http: HttpClient,
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadProfile();
  }

  async loadProfile() {
    const user = this.auth.currentUser;
    if (!user) return;

    const docRef = doc(this.firestore, 'consultants', user.uid);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      this.name = data['name'] || '';
      this.bio = data['bio'] || '';
      this.availabilityFrom = data['availabilityFrom'] || '';
      this.availabilityTo = data['availabilityTo'] || '';
      this.rates = data['rates'] || '0';
      this.expertise = data['expertise'] || '';
      this.imageUrl = data['imageUrl'] || '';
      this.certificateUrl = data['certificateUrl'] || '';
      this.viewMode = true;
    } else {
      this.viewMode = false;
    }
  }

  adjustRate(amount: number) {
    const currentRate = parseInt(this.rates || '0', 10);
    const newRate = currentRate + amount;
    this.rates = newRate > 0 ? newRate.toString() : '0';
  }

  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'consultant_unsigned');
    const cloudName = 'dpew5sddn';

    this.uploading = true;
    this.http.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData)
      .subscribe({
        next: (res: any) => {
          this.imageUrl = res.secure_url;
          this.uploading = false;
        },
        error: () => {
          this.uploading = false;
          alert('Error uploading image.');
        }
      });
  }

  onCertificateUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'consultant_unsigned');
    const cloudName = 'dpew5sddn';

    this.certificateUploading = true;
    this.http.post(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, formData)
      .subscribe({
        next: (res: any) => {
          this.certificateUrl = res.secure_url;
          this.certificateUploading = false;
        },
        error: () => {
          this.certificateUploading = false;
          alert('Error uploading certificate.');
        }
      });
  }

  async saveProfile() {
    const user = this.auth.currentUser;
    if (!user) return;

    if (!this.certificateUrl) {
      alert("Please upload your provisional certificate.");
      return;
    }

    const docRef = doc(this.firestore, 'consultants', user.uid);
    await setDoc(docRef, {
      name: this.name,
      bio: this.bio,
      availabilityFrom: this.availabilityFrom,
      availabilityTo: this.availabilityTo,
      rates: this.rates,
      expertise: this.expertise,
      imageUrl: this.imageUrl,
      certificateUrl: this.certificateUrl
    });

    this.viewMode = true;
    alert('Profile saved!');
  }

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/pages/home']);
    });
  }

  getReadableDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString();
  }
}
