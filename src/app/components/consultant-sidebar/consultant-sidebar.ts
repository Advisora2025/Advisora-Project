import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consultant-sidebar', 
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './consultant-sidebar.html',
  styleUrl: './consultant-sidebar.css'
})
export class ConsultantSidebar {

}
