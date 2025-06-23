import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consultant } from './consultant'; 

@Injectable({
  providedIn: 'root'
})
export class ConsultantService {
  private apiUrl = 'http://localhost:3000/api/consultants'; 

  constructor(private http: HttpClient) {}

  getConsultants(): Observable<Consultant[]> {
    return this.http.get<Consultant[]>(this.apiUrl);
  }

  deleteConsultant(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  addConsultant(consultant: Consultant): Observable<Consultant> {
    return this.http.post<Consultant>(this.apiUrl, consultant);
  }
}
