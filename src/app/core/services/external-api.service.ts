import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ExternalApiService {
  private apiUrl = 'https://ravishing-courtesy-production.up.railway.app';
  private tokenKey = 'apiToken';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Método para autenticar y obtener el token de acceso
  async authenticate(): Promise<void> {
    try {
      const response: any = await this.http
        .post(`${this.apiUrl}/user/login`, {
          username: 'andres.henaohilders@unicolombo.edu.co',
          password: '1041974512',
        })
        .toPromise();
  
      // Guardar el token de acceso en localStorage
      const token = response.data?.access_token;
      if (token) {
        localStorage.setItem(this.tokenKey, token);
      } else {
        throw new Error('No se recibió un token de acceso válido.');
      }
    } catch (error) {
      console.error('Error al autenticar con la API:', error);
      throw error;
    }
  }

  // Obtener el token de acceso almacenado
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Método para enviar notificaciones
  async sendNotification(payload: any): Promise<void> {
    await this.http.post(`${this.apiUrl}/notifications`, payload).toPromise();
  }

  // Método para construir y enviar la notificación
  async notifyContact(contact: any): Promise<void> {
    const payload = {
      token: contact.token,
      notification: {
        title: 'Llamada entrante',
        body: `${contact.name} te está llamando`,
      },
      android: {
        priority: 'high',
        data: {
          userId: contact.id,
          meetingId: uuidv4(), // Generar un ID único para la llamada
          type: 'incoming_call',
          name: contact.name,
          userFrom: contact.userFrom,
        },
      },
    };
  
    await this.sendNotification(payload);
  }
}