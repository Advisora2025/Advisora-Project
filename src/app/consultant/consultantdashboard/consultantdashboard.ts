import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, collection, query, where, getDocs} from '@angular/fire/firestore';

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

        
  // Sort dates once here
  if (this.consultantData.availableDates?.length) {
    this.consultantData.availableDates.sort();
  }
        // Convert existing times to 24-hour format if needed
        if (this.consultantData.availabilityFromTime) {
          this.consultantData.availabilityFromTime = this.convertTo24HourFormat(this.consultantData.availabilityFromTime);
        }
        if (this.consultantData.availabilityToTime) {
          this.consultantData.availabilityToTime = this.convertTo24HourFormat(this.consultantData.availabilityToTime);
        }
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  // Add these new methods for time handling
  private convertTo24HourFormat(timeString: string): string {
    if (!timeString) return '';

    // Handle case if already in 24-hour format
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      return timeString;
    }

    // Handle 12-hour format with AM/PM
    const time = timeString.toLowerCase().trim();
    let [hours, minutes] = time.replace(/[ap]m/, '').trim().split(/[ :]/);
    
    if (time.includes('pm') && hours !== '12') {
      hours = (parseInt(hours, 10) + 12).toString();
    } else if (time.includes('am') && hours === '12') {
      hours = '00';
    }

    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  private validateTimes(): boolean {
    const from = this.consultantData.availabilityFromTime;
    const to = this.consultantData.availabilityToTime;

    // Basic format validation
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(from) || 
        !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(to)) {
      alert('Please enter times in valid HH:mm format (e.g., 09:00 or 17:30)');
      return false;
    }

    // Convert to minutes for comparison
    const [fromHours, fromMins] = from.split(':').map(Number);
    const [toHours, toMins] = to.split(':').map(Number);
    
    const fromTotal = fromHours * 60 + fromMins;
    const toTotal = toHours * 60 + toMins;

    if (toTotal <= fromTotal) {
      alert('End time must be after start time');
      return false;
    }

    if (fromMins % 30 !== 0 || toMins % 30 !== 0) {
      alert('Times must be in 30-minute increments (e.g., 09:00 or 09:30)');
      return false;
    }

    return true;
  }

  // Update the saveProfile method
  async saveProfile() {
    // Convert input times to 24-hour format before saving
    this.consultantData.availabilityFromTime = this.convertTo24HourFormat(this.consultantData.availabilityFromTime);
    this.consultantData.availabilityToTime = this.convertTo24HourFormat(this.consultantData.availabilityToTime);

    // Validate times
    if (!this.validateTimes()) {
      return;
    }

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

    if (!this.consultantData.availableDates || this.consultantData.availableDates.length === 0) {
      alert('Please select at least one available date.');
      return;
    }

    const docRef = doc(this.firestore, 'consultants', this.userId);
    await setDoc(docRef, this.consultantData);
    this.editProfile = false;
    alert('Profile saved successfully!');
  }

  // Keep all other existing methods unchanged
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
 

// addAvailableDate() {
//   this.dateWarning = '';

//   if (!this.newAvailableDate) {
//     this.dateWarning = "⚠️ Please select a valid date.";
//     return;
//   }

//   const today = new Date().toISOString().split("T")[0];
//   if (this.newAvailableDate < today) {
//     this.dateWarning = "⚠️ Please choose a future date.";
//     return;
//   }

//   // ✅ Date format validation - check if it's a real calendar date (e.g., not Feb 30)
//   const parts = this.newAvailableDate.split('-');
//   const year = parseInt(parts[0], 10);
//   const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
//   const day = parseInt(parts[2], 10);

//   const dateObj = new Date(year, month, day);
//   if (
//     dateObj.getFullYear() !== year ||
//     dateObj.getMonth() !== month ||
//     dateObj.getDate() !== day
//   ) {
//     this.dateWarning = "⚠️ Invalid calendar date.";
//     return;
//   }

//   if (!this.consultantData.availableDates) {
//     this.consultantData.availableDates = [];
//   }

//   if (this.consultantData.availableDates.includes(this.newAvailableDate)) {
//     this.dateWarning = "⚠️ This date is already added.";
//     return;
//   }

//   this.consultantData.availableDates.push(this.newAvailableDate);
//   this.newAvailableDate = '';
// }
addAvailableDate() {
  this.dateWarning = '';

  if (!this.newAvailableDate) {
    this.dateWarning = "⚠️ Please select a valid date.";
    return;
  }

  const parts = this.newAvailableDate.split('-');
  const yearStr = parts[0];

  if (yearStr.length !== 4 || !/^\d{4}$/.test(yearStr)) {
    this.dateWarning = "⚠️ Please select a valid date Year .";
    return;
  }

  const year = parseInt(yearStr, 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const dateObj = new Date(year, month, day);
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month ||
    dateObj.getDate() !== day
  ) {
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




  // removeDate(date: string) {
  //   this.consultantData.availableDates = this.consultantData.availableDates.filter((d: string) => d !== date);
  // }
  async removeDate(date: string) {
  this.dateRemoveWarning = ''; // Clear previous warning

  try {
    // Firestore reference to sessions collection
    const sessionsRef = collection(this.firestore, 'sessions');

    // Query for sessions with this consultant and this date
    const q = query(
      sessionsRef,
      where('consultantUid', '==', this.userId),
      where('availableDate', '==', date)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Block removal if sessions exist
      this.dateRemoveWarning = `❌ Cannot remove ${this.formatDateDisplay(date)} — sessions already booked.`;
      console.warn(`Blocked date removal: sessions found on ${date}`);
      return;
    }

    // No sessions found, proceed with removal
    this.consultantData.availableDates = this.consultantData.availableDates.filter((d: string) => d !== date);
    console.log(`Date removed: ${date}`);
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