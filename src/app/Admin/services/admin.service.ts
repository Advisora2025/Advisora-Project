import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private firestore: Firestore) {}

  // Get all users
  async getAllUsers() {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Get all consultants
  async getAllConsultants() {
    const consultantsRef = collection(this.firestore, 'consultants');
    const q = query(consultantsRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Get all clients
  async getAllClients() {
    const clientsRef = collection(this.firestore, 'clients');
    const q = query(clientsRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Update user data
  async updateUser(userId: string, data: any) {
    const userRef = doc(this.firestore, 'users', userId);
    await updateDoc(userRef, data);
  }

  // Delete user
  async deleteUser(userId: string) {
    const userRef = doc(this.firestore, 'users', userId);
    await deleteDoc(userRef);
  }
}