import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Consultant } from '../../services/consultant';
import { ConsultantService } from '../../services/consultant.service';

@Component({
  selector: 'app-consultants',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consultants.html',
  styleUrl: './consultants.css',
  
})
export class Consultants implements OnInit {
  consultants: Consultant[] = [];

  constructor(private consultantService: ConsultantService) {}

  ngOnInit(): void {
    this.fetchConsultants();
  }

  fetchConsultants(): void {
    this.consultantService.getConsultants().subscribe((data) => {
      this.consultants = data;
    });
  }

  deleteConsultant(id: number): void {
    const confirmDelete = confirm('Are you sure you want to delete this consultant?');
    if (confirmDelete) {
      this.consultantService.deleteConsultant(id).subscribe(() => {
        this.consultants = this.consultants.filter(c => c.id !== id);
      },
       error => {
      console.error('Error deleting consultant:', error);
    });
      
    }
  }

}
