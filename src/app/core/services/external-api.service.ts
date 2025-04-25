import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';
import { HttpErrorResponse } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class ExternalApiService {
  private apiUrl = 'https://ravishing-courtesy-production.up.railway.app';
  private tokenKey = 'authToken';

  constructor(private http: HttpClient, private authService: AuthService) {}

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
  
      const tokenWithBearer = response.data?.access_token;
      const token = tokenWithBearer.replace('Bearer ', '');
      console.log('Token recibido de la API (sin Bearer):', token);
  
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
      console.log('Enviando notificación con payload:', payload);
      console.log('Encabezados de la solicitud:', headers);
  
      const response = await this.http.post(`${this.apiUrl}/notifications`, payload, { headers }).toPromise();
      console.log('Notificación enviada con éxito:', response);
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
    
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

  async notifyContact(contact: any): Promise<string> {
    try {
      const firstName = contact.firstName || 'Nombre';
      const lastName = contact.lastName || 'Desconocido';
  
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No se pudo obtener el usuario autenticado.');
      }
  
      const userFrom = currentUser.uid;
      const meetingId = uuidv4(); 
  
      const payload = {
        token: contact.token,
        notification: {
          title: 'Llamada entrante',
          body: `${firstName} ${lastName} te está llamando`,
        },
        android: {
          priority: 'high',
          data: {
            userId: contact.id || 'ID_USUARIO_DESTINO',
            meetingId,
            type: 'incoming_call',
            name: `${firstName} ${lastName}`,
            userFrom: userFrom,
          },
        },
      };
  
      await this.authenticateAndSendNotification(payload);
  
      return meetingId; 
    } catch (error) {
      console.error('Error al notificar al contacto:', error);
      throw error;
    }
  }
  
}