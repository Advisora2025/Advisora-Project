import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirebaseDataService } from '../../services/firebase-data.service';

@Component({
  selector: 'app-aboutconsultant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aboutconsultant.html'
})
export class AboutConsultant implements OnInit {
  consultantId!: string;
  consultant: any;

  constructor(
    private route: ActivatedRoute,
    private firebaseData: FirebaseDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.consultantId = this.route.snapshot.paramMap.get('id')!;
    this.firebaseData.getConsultantById(this.consultantId).subscribe(data => {
      this.consultant = data;
    });
  }

  bookNow() {
    this.router.navigate(['/pages/clientsession', this.consultantId]); 
  }
}
