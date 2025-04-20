import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class ExternalApiService {
  private apiUrl = 'https://ravishing-courtesy-production.up.railway.app';
  private tokenKey = 'authToken';

  constructor(private http: HttpClient) {}

  async authenticateAndSendNotification(payload: any): Promise<void> {
    try {
      console.log('Llamando a authenticate...');
      await this.authenticate();
      console.log('Autenticación completada. Enviando notificación...');
      await this.sendNotification(payload);
    } catch (error) {
      console.error('Error en el flujo de autenticación o notificación:', error);
    }
  }

  async authenticate(): Promise<void> {
    try {
      console.log('Ejecutando el método authenticate...');
      const response: any = await this.http
        .post(`${this.apiUrl}/user/login`, {
          email: 'andres.henaohilders@unicolombo.edu.co',
          password: '1041974512',
        })
        .toPromise();
  
      console.log('Respuesta completa de la API:', response);
  
      const token = response.data?.access_token;
      console.log('Token recibido de la API:', token);
  
      if (token) {
        localStorage.setItem(this.tokenKey, token);
        console.log('Token guardado en localStorage:', localStorage.getItem(this.tokenKey));
      } else {
        throw new Error('No se recibió un token de acceso válido.');
      }
    } catch (error) {
      console.error('Error al autenticar con la API:', error);
      throw error;
    }
  }
  
  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    console.log('Token recuperado:', token);
    return token;
  }
  
  async sendNotification(payload: any): Promise<void> {
    const token = this.getToken();
    if (!token) {
      console.error('Token no encontrado en localStorage');
      throw new Error('No se encontró un token de autenticación. Por favor, autentíquese nuevamente.');
    }
  
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  
    try {
      await this.http.post(`${this.apiUrl}/notifications`, payload, { headers }).toPromise();
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
      throw error;
    }
  }

  async notifyContact(contact: any): Promise<void> {
    const payload = 
    {
      token: contact.token,
      notification: {
        title: 'Llamada entrante',
        body: `${contact.name} te está llamando`,
      },
      android: {
        priority: 'high',
        data: {
          userId: contact.id,
          meetingId: uuidv4(), 
          type: 'incoming_call',
          name: contact.name,
          userFrom: contact.userFrom,
        },
      },
    };
  
    await this.sendNotification(payload);
  }
}