import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, collection, query, where, getDocs } from '@angular/fire/firestore';

@Component({
  selector: 'app-consultantdashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    availableDates: [],
    availabilityFromTime: '',
    availabilityToTime: '',
    consultationRates: null,
    imageUrl: '',
    certificateUrl: ''
  };
  showDatesPopup: boolean = false;

  userId: string = '';
  editProfile: boolean = false;
  uploadingImage = false;
  uploadingCertificate = false;

  newAvailableDate: string = '';
  dateWarning: string = '';
  dateRemoveWarning: string = '';

  constructor(private auth: Auth, private firestore: Firestore, private router: Router) {}

  async ngOnInit() {

    this.router.events.subscribe(event => {
    if (event instanceof NavigationEnd) {
      document.querySelectorAll('.modal-backdrop, .show')
        .forEach(e => e.remove());
      document.body.classList.remove('modal-open'); // optional but good
    }
  });
  

    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.userId = user.uid;
        this.consultantData.name = user.displayName || '';
        this.consultantData.email = user.email || '';
        this.consultantData.phone = user.phoneNumber || '';

        const docRef = doc(this.firestore, 'consultants', this.userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          this.consultantData = { ...this.consultantData, ...docSnap.data() };
          if (this.consultantData.availableDates?.length) {
            this.consultantData.availableDates.sort();
          }
        }
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  private convertTo24HourFormat(timeString: string): string {
    if (!timeString) return '';
    const time = timeString.toLowerCase().trim();
    let [timePart, modifier] = time.includes('am') || time.includes('pm')
      ? [time.replace(/(am|pm)/, '').trim(), time.includes('pm') ? 'pm' : 'am']
      : [time, ''];

    let [hours, minutes] = timePart.split(':');
    hours = hours.trim();
    minutes = minutes?.trim() || '00';

    let hourNum = parseInt(hours, 10);
    if (modifier === 'pm' && hourNum !== 12) hourNum += 12;
    if (modifier === 'am' && hourNum === 12) hourNum = 0;

    return `${hourNum.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  private convertTo12HourFormat(time24: string): string {
    if (!time24) return '';
    const [hourStr, minutes] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
  }

  private validateTimes(from: string, to: string): boolean {
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(from) || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(to)) {
      alert('Please enter times in HH:mm format (e.g., 09:00 or 17:30)');
      return false;
    }

    const [fromHours, fromMins] = from.split(':').map(Number);
    const [toHours, toMins] = to.split(':').map(Number);
    const fromTotal = fromHours * 60 + fromMins;
    const toTotal = toHours * 60 + toMins;

    if (toTotal <= fromTotal) {
      alert('End time must be after start time');
      return false;
    }

    if (fromMins % 30 !== 0 || toMins % 30 !== 0) {
      alert('Times must be in 30-minute increments');
      return false;
    }

    return true;
  }

  async saveProfile() {
    const from24 = this.convertTo24HourFormat(this.consultantData.availabilityFromTime);
    const to24 = this.convertTo24HourFormat(this.consultantData.availabilityToTime);

    if (!this.validateTimes(from24, to24)) return;

    this.consultantData.availabilityFromTime = this.convertTo12HourFormat(from24);
    this.consultantData.availabilityToTime = this.convertTo12HourFormat(to24);

    const requiredFields = [
      'name', 'email', 'phone', 'bio', 'expertise',
      'availabilityFromTime', 'availabilityToTime',
      'consultationRates', 'imageUrl', 'certificateUrl'
    ];

    for (let field of requiredFields) {
      if (!this.consultantData[field]) {
        alert(`Please fill in ${field}.`);
        return;
      }
    }

    if (!this.consultantData.availableDates?.length) {
      alert('Please select at least one available date.');
      return;
    }

    const docRef = doc(this.firestore, 'consultants', this.userId);
    await setDoc(docRef, this.consultantData);
    this.editProfile = false;
    alert('Profile saved successfully!');
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
    if (!file || !file.type.startsWith('image/')) {
      alert('Only image files are allowed for certificates (e.g., JPG, PNG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Certificate image size must be less than 5MB.');
      return;
    }

    this.uploadingCertificate = true;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'consultant_unsigned');
    formData.append('folder', 'consultant/certificates');

    const res = await fetch('https://api.cloudinary.com/v1_1/dpew5sddn/image/upload', {
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

  addAvailableDate() {
    this.dateWarning = '';

    if (!this.newAvailableDate) {
      this.dateWarning = "⚠️ Please select a valid date.";
      return;
    }

    const parts = this.newAvailableDate.split('-');
    const yearStr = parts[0];
    if (yearStr.length !== 4 || !/^\d{4}$/.test(yearStr)) {
      this.dateWarning = "⚠️ Please select a valid date Year.";
      return;
    }

    const year = parseInt(yearStr, 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const dateObj = new Date(year, month, day);
    if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month || dateObj.getDate() !== day) {
      this.dateWarning = "⚠️ Invalid calendar date.";
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    if (this.newAvailableDate < today) {
      this.dateWarning = "⚠️ Please choose a future date.";
      return;
    }

    if (!this.consultantData.availableDates) {
      this.consultantData.availableDates = [];
    }

    if (this.consultantData.availableDates.includes(this.newAvailableDate)) {
      this.dateWarning = "⚠️ This date is already added.";
      return;
    }

    this.consultantData.availableDates.push(this.newAvailableDate);
    this.newAvailableDate = '';
  }

  async removeDate(date: string) {
    this.dateRemoveWarning = '';
    try {
      const sessionsRef = collection(this.firestore, 'sessions');
      const q = query(
        sessionsRef,
        where('consultantUid', '==', this.userId),
        where('availableDate', '==', date)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        this.dateRemoveWarning = `❌ Cannot remove ${this.formatDateDisplay(date)} — sessions already booked.`;
        return;
      }

      this.consultantData.availableDates = this.consultantData.availableDates.filter((d: string) => d !== date);
    } catch (error) {
      console.error('Error checking for sessions:', error);
      this.dateRemoveWarning = '⚠️ Unable to verify session bookings. Try again later.';
    }
  }

  formatDateDisplay(isoDate: string): string {
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
  }

  cancelEdit() {
    this.editProfile = false;
  }

  logout() {
    this.auth.signOut();
    this.router.navigate(['home']);
  }
}
