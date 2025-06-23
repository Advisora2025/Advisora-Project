import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Session } from './session'; // Adjust the path if needed

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private apiUrl = 'http://localhost:3000/api/session';

  constructor(private http: HttpClient) {}

  // Get all sessions
  getSessions(): Observable<Session[]> {
    return this.http.get<Session[]>(this.apiUrl);
  }

  // Create a new session
  createSession(session: Partial<Session>): Observable<Session> {
    return this.http.post<Session>(this.apiUrl, session);
  }

  // Delete session by ID
  deleteSession(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Update session status
  updateStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status });
  }
}
