import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aboutconsultant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aboutconsultant.html'
})
export class AboutConsultant {
  consultantId: number = 0;

  constructor(private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.consultantId = +params['id'];
    });
  }
}
