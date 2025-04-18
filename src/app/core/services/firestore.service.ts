import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, collection, query, where, getDocs } from '@angular/fire/firestore';
import { collectionData } from '@angular/fire/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) { }

  createDocumentWithId(data: any, path: string, id: string) {
    const document = doc(this.firestore, `${path}/${id}`);
    return setDoc(document, data);
  }

  async searchUsersByPhone(phone: string): Promise<any[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('phone', '==', phone));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addContact(user: any, currentUserId: string): Promise<void> {
    try {
      const contactRef = collection(this.firestore, `users/${currentUserId}/contacts`);
      
      const q = query(contactRef, where('phone', '==', user.phone));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        throw new Error('El contacto ya ha sido agregado.');
      }
  
      const newContactId = uuidv4();
      const contactData = {
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      };
  
      await setDoc(doc(contactRef, newContactId), contactData);
    } catch (error) {
      console.error('Error al agregar contacto:', error);
      throw error;
    }
  }

  getContacts(userId: string): Observable<any[]> {
    const contactsRef = collection(this.firestore, `users/${userId}/contacts`);
    return collectionData(contactsRef, { idField: 'id' }) as Observable<any[]>;
  }

  async checkPhoneExists(phone: string): Promise<boolean> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }
  
}
