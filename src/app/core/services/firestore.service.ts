import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, collection, query, where, getDocs, updateDoc, onSnapshot, getDoc, orderBy, Timestamp, addDoc, serverTimestamp, deleteDoc } from '@angular/fire/firestore';
import { collectionData } from '@angular/fire/firestore';
import { v4 as uuidv4 } from 'uuid';
import { combineLatest, from, map, Observable, switchMap, tap } from 'rxjs';
import { Users } from 'src/app/models/users.models';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: Firestore) { }

  async updateUserToken(userId: string, token: string): Promise<void> {
    const userRef = doc(this.firestore, `users/${userId}`);
    await setDoc(userRef, { token }, { merge: true });
  }

  createDocumentWithId(data: any, path: string, id: string) {
    const document = doc(this.firestore, `${path}/${id}`);
    return setDoc(document, data);
  }

  async searchUsersByPhone(phone: string): Promise<any[]> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
  
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      firstName: doc.data()['firstName'] || 'Nombre',
      lastName: doc.data()['lastName'] || 'Desconocido',
      phone: doc.data()['phone'],
      token: doc.data()['token'] || '',
    }));
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

  getContactsWithProfiles(userId: string): Observable<any[]> {
    const contactsRef = collection(this.firestore, `users/${userId}/contacts`);

    return collectionData(contactsRef).pipe(
      switchMap((contacts: any[]) => {
        const userRequests = contacts.map(contact => {
          const q = query(collection(this.firestore, 'users'), where('phone', '==', contact.phone));
          return from(getDocs(q)).pipe(
            map(snapshot => {
              const doc = snapshot.docs[0];
              return doc ? { id: doc.id, ...doc.data() } : contact;
            })
          );
        });

        return combineLatest(userRequests);
      })
    );
  }

  async checkPhoneExists(phone: string): Promise<boolean> {
    const usersRef = collection(this.firestore, 'users');
    const q = query(usersRef, where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }
  
  async createCall(callData: any): Promise<void> {
    const callRef = doc(this.firestore, `calls/${callData.meetingId}`);
    await setDoc(callRef, callData);
  }

  listenCallStatus(meetingId: string): Observable<any> {
    return new Observable((observer) => {
      const callRef = doc(this.firestore, `calls/${meetingId}`);
      const unsubscribe = onSnapshot(callRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          observer.next(docSnapshot.data());
        } else {
          observer.error('La llamada no existe');
        }
      });

      return () => unsubscribe();
    });
  }

  async updateCallStatus(meetingId: string, status: string): Promise<void> {
    const callRef = doc(this.firestore, `calls/${meetingId}`);
    const callDoc = await getDoc(callRef);

    if (!callDoc.exists()) {
        console.error('El documento no existe');
        throw new Error('Documento no encontrado');
    }

    await updateDoc(callRef, { status });
  }

  async getUserDocument(userId: string): Promise<any> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      const userDoc = await getDoc(userRef);
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error obteniendo documento de usuario:', error);
      throw error;
    }
  }

  async updateUserProfileImage(userId: string, imageUrl: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      await updateDoc(userRef, {
        profileImage: imageUrl,
        updatedAt: Timestamp.now() 
      });
    } catch (error) {
      console.error('Error al actualizar la imagen de perfil:', error);
      throw error;
    }
  }

  async updateUserData(userId: string, data: Partial<Users>): Promise<void> {
    try {
      const userRef = doc(this.firestore, `users/${userId}`);
      await updateDoc(userRef, {
        ...data,
        updatedAt: Timestamp.now() 
      });
    } catch (error) {
      console.error('Error al actualizar datos de usuario:', error);
      throw error;
    }
  }

  async sendMessage(chatId: string, message: any) {
    const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
    return addDoc(messagesRef, {
      ...message,
      createdAt: serverTimestamp()
    });
  }

  getMessages(chatId: string) {
    const messagesRef = collection(this.firestore, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    return collectionData(q, { idField: 'id' });
  }

  getChatId(user1Id: string, user2Id: string) {
    return [user1Id, user2Id].sort().join('_');
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const contactsRef = collection(this.firestore, `users/${userId}/contacts`);
      const contactsSnap = await getDocs(contactsRef);
      for (const contact of contactsSnap.docs) {
        await deleteDoc(contact.ref);
      }
      const userRef = doc(this.firestore, `users/${userId}`);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
}
