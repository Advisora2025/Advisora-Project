import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { FirebaseDataService } from '../../services/firebase-data.service';
import { ConsultantDetailsDialog } from '../consultant-details-dialog/consultant-details-dialog';


@Component({
  selector: 'app-consultants',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultants.html',
  styleUrl: './consultants.css',
  
})
export class Consultants  implements OnInit {

  consultants: any[] = [];

  constructor(
    private firebaseData: FirebaseDataService,
    private dialog: MatDialog)
      {}

  openDetailsDialog(consultant: Consultants): void {
    this.dialog.open(ConsultantDetailsDialog, {
      width: '800px',
      data: consultant
    });
  }
  ngOnInit(): void {
    
    this.firebaseData.getConsultants().subscribe(data => {
      this.consultants = data;
    });
  }
  async updateStatus(consultant: any, newStatus: 'accepted' | 'denied') {
  const confirmAction = confirm(`Are you sure you want to ${newStatus} this consultant?`);
  if (!confirmAction) return;

  try {
    await this.firebaseData.updateConsultantStatus(consultant.id, newStatus);
    consultant.status = newStatus; // update view
  } catch (err) {
    console.error('Error updating status:', err);
    alert('Failed to update status. Try again.');
  }
}


}
