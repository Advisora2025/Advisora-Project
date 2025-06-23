import { Component, OnInit } from '@angular/core';
import { Session as  SessionModel} from '../../services/session';
import { SessionService } from '../../services/session.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './session.html',
  styleUrl: './session.css'
})
export class Session implements OnInit {
  sessions: SessionModel[] = [];

  constructor(private sessionService: SessionService) {}

  ngOnInit(): void {    
    this.fetchSessions();
  }

  fetchSessions(): void {
    this.sessionService.getSessions().subscribe(
      (data) => {
        this.sessions = data;
      },
      (error) => {
        console.error('Error fetching sessions:', error);
      }
    );
  }

  deleteSession(id: number): void {
    const confirmDelete = confirm('Are you sure you want to delete this session?');
    if (confirmDelete) {
      this.sessionService.deleteSession(id).subscribe(
        () => {
          this.sessions = this.sessions.filter(s => s.id !== id);
        },
        (error) => {
          console.error('Error deleting session:', error);
        }
      );
    }
  }

}
