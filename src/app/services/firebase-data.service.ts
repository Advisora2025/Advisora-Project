import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { DocumentData } from 'firebase/firestore';
import { doc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirebaseDataService {
  constructor(private firestore: Firestore) {}

  getClients(): Observable<DocumentData[]> {
    const clientsRef = collection(this.firestore, 'clients');
    return collectionData(clientsRef, { idField: 'id' });
  }
  
  getConsultants(): Observable<DocumentData[]> {
    const consultantsRef = collection(this.firestore, 'consultants');
    return collectionData(consultantsRef, { idField: 'id' });
  }

  updateConsultantStatus(consultantId: string, status: 'accepted' | 'denied') {
  const consultantRef = doc(this.firestore, 'consultants', consultantId); 
  return updateDoc(consultantRef, { status });
}
}
