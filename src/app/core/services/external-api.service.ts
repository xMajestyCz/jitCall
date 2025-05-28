import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExternalApiService {
  private tokenKey = 'authToken';

  constructor(private http: HttpClient) {}

  async authenticateAndSendNotification(payload: any): Promise<void> {
    try {
      await this.authenticate();
      await this.sendNotification(payload);
    } catch (error) {
      console.error('Error en el flujo de autenticación o notificación:', error);
    }
  }

  async authenticate(): Promise<void> {
    try {
      const response: any = await this.http
        .post(`${environment.apiUrl}/user/login`, {
          email: environment.email,
          password: environment.password,
        })
        .toPromise();
    
      const tokenWithBearer = response.data?.access_token;
      const token = tokenWithBearer.replace('Bearer ', '');
  
      if (token) {
        localStorage.setItem(this.tokenKey, token);
      } else {
        throw new Error('No se recibió un token de acceso válido.');
      }
    } catch (error) {
      console.error('Error al autenticar con la API:', error);
    }
  }

  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    return token;
  }

  async sendNotification(payload: any): Promise<void> {
    const token = this.getToken();
  
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  
    try {
      await this.http.post(`${environment.apiUrl}/notifications`, payload, { headers }).toPromise();
    } catch (error) {    
      const httpError = error as HttpErrorResponse;
    
      if (httpError.status === 500) {
        console.error('Error interno del servidor. Verifica los logs del servidor.');
      } else if (httpError.status === 401) {
        console.error('Token de autenticación inválido o expirado.');
      } else {
        console.error('Error desconocido:', httpError.message);
      }
    
      throw error;
    }
  }

  async notifyContact(contact: any): Promise<void> {
    try {
      const firstName = contact.firstName || 'Nombre';
      const lastName = contact.lastName || 'Desconocido';
      const userFrom = contact.userFrom;
      const meetingId = contact.meetingId;

      const payload = {
        token: contact.token,
        notification: {
          title: 'Llamada entrante',
          body: `${firstName} ${lastName} te está llamando`,
        },
        android: {
          priority: 'high',
          data: {
            userId: contact.id,
            meetingId: meetingId,
            type: 'incoming_call',
            name: `${firstName} ${lastName}`,
            userFrom: userFrom,
          },
        },
      };

      await this.authenticateAndSendNotification(payload);

    } catch (error) {
      throw error;
    }
  }  
}